# Job Application Logger - Project Blueprint

## 1) Product Goal
Build a personal app to track and manage all job applications in one place.

The app should help you:
- Log each application quickly.
- Track current status and next steps.
- Keep related links, notes, and deadlines.
- Review progress over time.

Tech stack:
- Frontend: React
- Backend: Xano

## 2) Target User
- Primary user: You (single-user app at first).
- Future optional users: Other job seekers (multi-user mode later).

## 3) Core MVP Features
1. Add an application entry.
2. View all applications in a list.
3. Filter by status (Applied, Interviewing, Offer, Rejected, Ghosted, Withdrawn).
4. Update an application status.
5. Add notes per application.
6. Track important dates (applied date, follow-up date, interview date).
7. View basic dashboard metrics.

## 4) Application Status Lifecycle
Recommended status values:
- Draft
- Applied
- Screening
- Interviewing
- Final Interview
- Offer
- Rejected
- Ghosted
- Withdrawn

Rules:
- Every application starts as `Draft` or `Applied`.
- Status changes should be timestamped in a status history table.
- `Offer`, `Rejected`, `Ghosted`, and `Withdrawn` are terminal states.

## 5) Information to Store Per Application
- Company name
- Job title
- Job post URL
- Location
- Work setup (Onsite/Hybrid/Remote)
- Compensation range (optional)
- Date applied
- Current status
- Priority (Low/Medium/High)
- Source (LinkedIn, Indeed, Referral, Company Site, etc.)
- Resume version used
- Cover letter version used
- Notes
- Next action
- Next action due date
- Contact person (name, role, email, LinkedIn)

## 6) Suggested Xano Data Model

### Table: `users`
Use Xano auth user table.

### Table: `applications`
- `id` (auto)
- `user_id` (relation to users)
- `company_name` (text, required)
- `job_title` (text, required)
- `job_post_url` (text)
- `location` (text)
- `work_setup` (enum: onsite, hybrid, remote, unknown)
- `salary_min` (integer, nullable)
- `salary_max` (integer, nullable)
- `currency` (text, default `USD`)
- `applied_at` (date, nullable)
- `status` (enum, required)
- `priority` (enum: low, medium, high)
- `source` (text)
- `resume_version` (text)
- `cover_letter_version` (text)
- `next_action` (text)
- `next_action_due_at` (date, nullable)
- `created_at`
- `updated_at`

### Table: `application_contacts`
- `id`
- `application_id` (relation)
- `name`
- `role`
- `email`
- `linkedin_url`
- `created_at`

### Table: `application_notes`
- `id`
- `application_id` (relation)
- `note_body` (text)
- `note_type` (enum: general, interview, followup, reminder)
- `created_at`

### Table: `application_status_history`
- `id`
- `application_id` (relation)
- `from_status` (enum)
- `to_status` (enum)
- `changed_at`
- `reason` (text, optional)

## 7) API Endpoints (Xano)
MVP endpoint list:

Auth:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`

Applications:
- `GET /applications` (supports filters: status, priority, date range, search)
- `POST /applications`
- `GET /applications/{id}`
- `PATCH /applications/{id}`
- `DELETE /applications/{id}`

Notes:
- `GET /applications/{id}/notes`
- `POST /applications/{id}/notes`
- `PATCH /notes/{id}`
- `DELETE /notes/{id}`

Contacts:
- `GET /applications/{id}/contacts`
- `POST /applications/{id}/contacts`
- `PATCH /contacts/{id}`
- `DELETE /contacts/{id}`

Status history:
- `GET /applications/{id}/status-history`
- `POST /applications/{id}/status-change`

Dashboard:
- `GET /dashboard/summary`
  - total applications
  - applications by status
  - response rate
  - interviews count
  - offers count

## 8) Frontend Screens (React)
1. Login / Sign up
2. Dashboard
3. Applications List
4. Application Detail
5. New Application Form
6. Edit Application Form
7. Settings (optional in MVP)

## 9) UX Notes
- Fast data entry is critical.
- Support quick status update from list row.
- Use color-coded badges for status.
- Show upcoming next actions at top of dashboard.
- Keep mobile layout usable (responsive tables/cards).

## 10) MVP Non-Functional Requirements
- Responsive design for laptop and mobile.
- Basic form validation.
- Secure auth with Xano token.
- User can only access own records.
- Basic auditability via status history and timestamps.

## 11) Metrics to Track
- Total applications this week/month.
- Interview conversion rate.
- Offer conversion rate.
- Average days from Applied -> Interview.
- Average days from Applied -> Rejected/Offer.

## 12) Build Phases

### Phase 1 - Foundation
- Finalize schema in Xano.
- Implement auth.
- React project setup with routing and API client.

### Phase 2 - Application CRUD
- Add/list/edit/delete applications.
- Filter and search on list page.

### Phase 3 - Notes + Contacts + History
- Add timeline-like detail page.
- Record status transitions.

### Phase 4 - Dashboard
- Build summary cards and charts.
- Add upcoming actions widget.

### Phase 5 - Polish
- Validation improvements.
- Better empty states/loading states.
- Export to CSV (optional).

## 13) Open Decisions
- Single user forever, or prepare for multi-user now?
- Do you want reminders (email/Telegram) for follow-up dates?
- Should we support file attachments (resume copy, offer PDF)?
- Should we include company-level tracking separate from applications?

