// Add a contact to an application.
query "application/contacts" verb=POST {
  api_group = "Applications"
  auth = "user"

  input {
    int application_id
    text name
    text role?
    email email?
    text linkedin_url?
    text notes?
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
  
    db.add application_contact {
      data = {
        created_at    : "now"
        application_id: $application.id
        name          : $input.name
        role          : $input.role
        email         : $input.email
        linkedin_url  : $input.linkedin_url
        notes         : $input.notes
      }
    } as $contact
  }

  response = $contact
}