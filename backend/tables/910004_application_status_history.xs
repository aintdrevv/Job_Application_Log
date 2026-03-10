// Tracks status changes to preserve application timeline.
table application_status_history {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    timestamp changed_at?=now
    int application_id? {
      table = "application"
    }
  
    enum from_status? {
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
  
    enum to_status? {
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
  
    text reason? filters=trim
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "changed_at", op: "desc"}]}
    {type: "btree", field: [{name: "application_id", op: "asc"}]}
    {
      type : "btree"
      field: [
        {name: "application_id", op: "asc"}
        {name: "changed_at", op: "desc"}
      ]
    }
  ]
}