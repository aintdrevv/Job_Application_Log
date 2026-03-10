// Add a note to an application.
query "application/notes" verb=POST {
  api_group = "Applications"
  auth = "user"

  input {
    int application_id
    enum note_type? {
      values = ["general", "interview", "followup", "reminder"]
    }
  
    text note_body
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
  
    db.add application_note {
      data = {
        created_at    : "now"
        application_id: $application.id
        note_type     : $input.note_type
        note_body     : $input.note_body
      }
    } as $note
  }

  response = $note
}