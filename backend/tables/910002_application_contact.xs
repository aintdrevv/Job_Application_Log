// Stores recruiter or interviewer contacts related to an application.
table application_contact {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    int application_id? {
      table = "application"
    }
  
    text name? filters=trim
    text role? filters=trim
    email? email filters=trim|lower
    text linkedin_url? filters=trim
    text notes? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree", field: [{name: "application_id", op: "asc"}]}
    {
      type : "btree"
      field: [
        {name: "application_id", op: "asc"}
        {name: "created_at", op: "desc"}
      ]
    }
  ]
}