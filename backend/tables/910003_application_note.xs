// Stores notes and journal entries for an application.
table application_note {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    int application_id? {
      table = "application"
    }
  
    enum note_type? {
      values = ["general", "interview", "followup", "reminder"]
    }
  
    text note_body? filters=trim
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