# Backend Tables (Xano)

These tables were added for the job application logger:

- `application`
- `application_contact`
- `application_note`
- `application_status_history`

All table files are in:
- `backend/tables/910001_application.xs`
- `backend/tables/910002_application_contact.xs`
- `backend/tables/910003_application_note.xs`
- `backend/tables/910004_application_status_history.xs`

## Table Design Notes

`application`
- One row per job application.
- Owned by `user_id`.
- Includes status, priority, dates, source, compensation, and next-action fields.
- Indexed for common filters: `user_id`, `status`, `priority`, `next_action_due_at`, and recent-first ordering.

`application_contact`
- Contacts associated with an application (recruiter, interviewer, etc.).

`application_note`
- Freeform notes associated with an application.
- Supports types: `general`, `interview`, `followup`, `reminder`.

`application_status_history`
- Immutable timeline of status changes.
- Tracks `from_status`, `to_status`, `changed_at`, and optional reason.

## API Group Strategy (Many Groups)

Your base URL pattern is:
- `https://x8ki-letl-twmt.n7.xano.io/api:EWRejxJg`

To support multiple API groups cleanly, frontend now supports:

1. Full base URL:
```env
VITE_XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:EWRejxJg
```

2. Host + group (recommended):
```env
VITE_XANO_API_HOST=https://x8ki-letl-twmt.n7.xano.io
VITE_XANO_API_GROUP=EWRejxJg
```

Switching groups only requires changing `VITE_XANO_API_GROUP` (for example between dev/staging/prod groups).

