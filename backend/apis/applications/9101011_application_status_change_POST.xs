// Change status and append timeline entry.
query "application/status-change" verb=POST {
  api_group = "Applications"
  auth = "user"

  input {
    int application_id
    enum to_status {
      values = [
        "draft"
        "applied"
        "screening"
        "interviewing"
        "final_interview"
        "offer"
        "rejected"
        "ghosted"
        "withdrawn"
      ]
    }
  
    text reason?
  }

  stack {
    db.get application {
      field_name = "id"
      field_value = $input.application_id
      output = ["id", "user_id", "status"]
    } as $application
  
    precondition ($application != null) {
      error_type = "notfound"
      error = "Application not found."
    }
  
    precondition ($application.user_id == $auth.id) {
      error_type = "accessdenied"
      error = "You do not have access to this application."
    }
  
    db.patch application {
      field_name = "id"
      field_value = $application.id
      data = {status: $input.to_status, updated_at: "now"}
    } as $updated_application
  
    db.add application_status_history {
      data = {
        created_at    : "now"
        changed_at    : "now"
        application_id: $application.id
        from_status   : $application.status
        to_status     : $input.to_status
        reason        : $input.reason
      }
    } as $status_history_entry
  }

  response = $updated_application
}