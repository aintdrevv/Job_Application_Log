// List authenticated user's applications.
query applications verb=GET {
  api_group = "Applications"
  auth = "user"

  input {
  }

  stack {
    db.query application {
      where = $db.application.user_id == $auth.id
      return = {type: "list"}
    } as $applications
  }

  response = $applications
}