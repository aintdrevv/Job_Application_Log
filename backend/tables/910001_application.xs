// Stores a single job application for a user.
table application {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }
  
    timestamp updated_at?=now {
      visibility = "private"
    }
  
    // Owner of this application record.
    int user_id? {
      table = "user"
    }
  
    text company_name? filters=trim
    text job_title? filters=trim
    text job_post_url? filters=trim
    text location? filters=trim
    enum work_setup? {
      values = ["onsite", "hybrid", "remote", "unknown"]
    }
  
    int salary_min?
    int salary_max?
    text currency?=USD filters=trim|upper
    timestamp applied_at?
    enum status? {
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
  
    enum priority? {
      values = ["low", "medium", "high"]
    }
  
    text source? filters=trim
    text resume_version? filters=trim
    text cover_letter_version? filters=trim
    text next_action? filters=trim
    timestamp next_action_due_at?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree", field: [{name: "updated_at", op: "desc"}]}
    {type: "btree", field: [{name: "user_id", op: "asc"}]}
    {type: "btree", field: [{name: "status", op: "asc"}]}
    {type: "btree", field: [{name: "priority", op: "asc"}]}
    {
      type : "btree"
      field: [{name: "next_action_due_at", op: "asc"}]
    }
    {type: "btree", field: [{name: "applied_at", op: "desc"}]}
    {
      type : "btree"
      field: [
        {name: "user_id", op: "asc"}
        {name: "status", op: "asc"}
        {name: "created_at", op: "desc"}
      ]
    }
  ]
}