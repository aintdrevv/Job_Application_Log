// List status history for an application.
query "application/status-history" verb=GET {
  api_group = "Applications"
  auth = "user"

  input {
    int application_id
  }

  stack {
    db.get application {
      field_name = "id"
      field_value = $input.application_id
      output = ["id", "user_id"]
    } as $application
  
    precondition ($application != null) {
      error_type = "notfound"
      error = "Application not found."
    }
  
    precondition ($application.user_id == $auth.id) {
      error_type = "accessdenied"
      error = "You do not have access to this application."
    }
  
    db.query application_status_history {
      where = $db.application_status_history.application_id == $application.id
      return = {type: "list"}
    } as $history
  }

  response = $history
}