// Get one application by id.
query "application/get" verb=GET {
  api_group = "Applications"
  auth = "user"

  input {
    int application_id
  }

  stack {
    db.get application {
      field_name = "id"
      field_value = $input.application_id
    } as $application
  
    precondition ($application != null) {
      error_type = "notfound"
      error = "Application not found."
    }
  
    precondition ($application.user_id == $auth.id) {
      error_type = "accessdenied"
      error = "You do not have access to this application."
    }
  }

  response = $application
}