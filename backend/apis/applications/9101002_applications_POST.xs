// Create an application.
query applications verb=POST {
  api_group = "Applications"
  auth = "user"

  input {
    text company_name
    text job_title
    text job_post_url?
    text location?
    enum work_setup? {
      values = ["onsite", "hybrid", "remote", "unknown"]
    }
  
    int salary_min?
    int salary_max?
    text currency?
    timestamp applied_at?
    enum status {
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
  
    text source?
    text resume_version?
    text cover_letter_version?
    text next_action?
    timestamp next_action_due_at?
  }

  stack {
    db.add application {
      data = {
        created_at          : "now"
        updated_at          : "now"
        user_id             : $auth.id
        company_name        : $input.company_name
        job_title           : $input.job_title
        job_post_url        : $input.job_post_url
        location            : $input.location
        work_setup          : $input.work_setup
        salary_min          : $input.salary_min
        salary_max          : $input.salary_max
        currency            : $input.currency
        applied_at          : $input.applied_at
        status              : $input.status
        priority            : $input.priority
        source              : $input.source
        resume_version      : $input.resume_version
        cover_letter_version: $input.cover_letter_version
        next_action         : $input.next_action
        next_action_due_at  : $input.next_action_due_at
      }
    } as $application
  
    db.add application_status_history {
      data = {
        created_at    : "now"
        changed_at    : "now"
        application_id: $application.id
        from_status   : "draft"
        to_status     : $application.status
        reason        : "created"
      }
    }
  }

  response = $application
}