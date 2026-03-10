import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  changeApplicationStatus,
  createApplicationContact,
  createApplicationNote,
  deleteApplication,
  getApplication,
  listApplicationContacts,
  listApplicationNotes,
  listApplicationStatusHistory,
} from "../lib/api";
import {
  APPLICATION_STATUSES,
  NOTE_TYPES,
  formatEnumLabel,
  formatSalaryRange,
} from "../lib/applicationModel";
import { useAuth } from "../state/AuthContext";

function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status) {
  return {
    draft: "bg-neutral-100 text-neutral-600 border-neutral-200",
    applied: "bg-indigo-50 text-indigo-700 border-indigo-200",
    screening: "bg-amber-50 text-amber-700 border-amber-200",
    interviewing: "bg-green-50 text-green-700 border-green-200",
    final_interview: "bg-green-50 text-green-700 border-green-200",
    offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    ghosted: "bg-red-50 text-red-700 border-red-200",
    withdrawn: "bg-red-50 text-red-700 border-red-200",
  }[status || "draft"];
}

function FieldValue({ label, value }) {
  return (
    <div className="rounded-[20px] border border-line bg-canvas px-4 py-4">
      <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-3 text-sm leading-6 text-ink">{value}</p>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const { token } = useAuth();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const id = Number(applicationId);
  const [application, setApplication] = useState(null);
  const [notes, setNotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [error, setError] = useState("");
  const [noteForm, setNoteForm] = useState({ note_type: "general", note_body: "" });
  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    email: "",
    linkedin_url: "",
    notes: "",
  });

  async function loadAll() {
    try {
      const [applicationData, notesData, contactsData, historyData] = await Promise.all([
        getApplication(token, id),
        listApplicationNotes(token, id),
        listApplicationContacts(token, id),
        listApplicationStatusHistory(token, id),
      ]);
      setApplication(applicationData);
      setNotes(Array.isArray(notesData) ? notesData : []);
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setStatusHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      setError(err.message || "Failed to load application details.");
    }
  }

  useEffect(() => {
    loadAll();
  }, [id, token]);

  const onStatusChange = async (event) => {
    const toStatus = event.target.value;
    try {
      await changeApplicationStatus(token, {
        application_id: id,
        to_status: toStatus,
        reason: "updated_from_detail",
      });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to update status.");
    }
  };

  const onAddNote = async (event) => {
    event.preventDefault();
    try {
      await createApplicationNote(token, { application_id: id, ...noteForm });
      setNoteForm({ note_type: "general", note_body: "" });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to add note.");
    }
  };

  const onAddContact = async (event) => {
    event.preventDefault();
    try {
      await createApplicationContact(token, { application_id: id, ...contactForm });
      setContactForm({ name: "", role: "", email: "", linkedin_url: "", notes: "" });
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to add contact.");
    }
  };

  const onDelete = async () => {
    const ok = window.confirm("Delete this application?");
    if (!ok) {
      return;
    }
    try {
      await deleteApplication(token, id);
      navigate("/applications", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to delete application.");
    }
  };

  if (!application) {
    return <p className="py-16 text-sm text-muted">Loading application details...</p>;
  }

  return (
    <section className="space-y-5">
      <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                Application detail
              </p>
              <h1 className="font-serif-ui text-4xl leading-none tracking-tight text-ink sm:text-5xl">
                {application.company_name}
              </h1>
              <p className="font-mono-ui text-xs uppercase tracking-[0.16em] text-muted">
                {application.job_title}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${statusClass(application.status)}`}
              >
                {formatEnumLabel(application.status)}
              </span>
              <span className="rounded-full border border-line px-3 py-1 font-mono-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {application.location || "Location N/A"}
              </span>
              <span className="rounded-full border border-line px-3 py-1 font-mono-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {application.priority || "medium"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/applications/${id}/edit`}
              className="rounded-full border border-line px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              Edit
            </Link>
            <button
              onClick={onDelete}
              className="rounded-full bg-neutral-900 px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
            >
              Delete
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              Overview
            </p>
            <h2 className="font-serif-ui text-3xl leading-none tracking-tight text-ink">
              Summary
            </h2>
          </div>

          <label className="block space-y-2">
            <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              Status
            </span>
            <select
              className="w-full min-w-[220px] rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              value={application.status || "draft"}
              onChange={onStatusChange}
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FieldValue label="Salary Range" value={formatSalaryRange(application)} />
          <FieldValue label="Applied At" value={formatDate(application.applied_at)} />
          <FieldValue label="Source" value={application.source || "Not set"} />
          <FieldValue label="Work Setup" value={formatEnumLabel(application.work_setup)} />
          <FieldValue label="Resume Version" value={application.resume_version || "Not set"} />
          <FieldValue
            label="Cover Letter Version"
            value={application.cover_letter_version || "Not set"}
          />
          <FieldValue label="Next Action" value={application.next_action || "Not set"} />
          <FieldValue
            label="Next Action Due"
            value={formatDate(application.next_action_due_at)}
          />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
          <div className="mb-6 space-y-2">
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              Notes
            </p>
            <h2 className="font-serif-ui text-3xl leading-none tracking-tight text-ink">
              Notes
            </h2>
          </div>

          <form onSubmit={onAddNote} className="space-y-4">
            <label className="block space-y-2">
              <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                Note Type
              </span>
              <select
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                value={noteForm.note_type}
                onChange={(event) =>
                  setNoteForm((prev) => ({ ...prev, note_type: event.target.value }))
                }
              >
                {NOTE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatEnumLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                Note
              </span>
              <textarea
                className="min-h-[120px] w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                rows={4}
                value={noteForm.note_body}
                onChange={(event) =>
                  setNoteForm((prev) => ({ ...prev, note_body: event.target.value }))
                }
                placeholder="Add note"
                required
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-neutral-900 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
            >
              Add note
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-[22px] border border-line bg-canvas px-4 py-4"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                    {formatEnumLabel(note.note_type)}
                  </span>
                </div>
                <p className="text-sm leading-6 text-ink">{note.note_body}</p>
              </article>
            ))}
            {notes.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
          <div className="mb-6 space-y-2">
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              Contacts
            </p>
            <h2 className="font-serif-ui text-3xl leading-none tracking-tight text-ink">
              Contacts
            </h2>
          </div>

          <form onSubmit={onAddContact} className="space-y-4">
            {[
              ["name", "Name", "text"],
              ["role", "Role", "text"],
              ["email", "Email", "email"],
              ["linkedin_url", "LinkedIn URL", "text"],
            ].map(([name, label, type]) => (
              <label key={name} className="block space-y-2">
                <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                  {label}
                </span>
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  placeholder={label}
                  type={type}
                  value={contactForm[name]}
                  onChange={(event) =>
                    setContactForm((prev) => ({ ...prev, [name]: event.target.value }))
                  }
                  required={name === "name"}
                />
              </label>
            ))}

            <label className="block space-y-2">
              <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                Notes
              </span>
              <textarea
                className="min-h-[96px] w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                rows={3}
                placeholder="Notes"
                value={contactForm.notes}
                onChange={(event) =>
                  setContactForm((prev) => ({ ...prev, notes: event.target.value }))
                }
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-neutral-900 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
            >
              Add contact
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {contacts.map((contact) => (
              <article
                key={contact.id}
                className="rounded-[22px] border border-line bg-canvas px-4 py-4"
              >
                <h3 className="font-serif-ui text-2xl leading-none tracking-tight text-ink">
                  {contact.name}
                </h3>
                <p className="mt-2 font-mono-ui text-xs uppercase tracking-[0.16em] text-muted">
                  {contact.role || "Role not set"}
                </p>
                <div className="mt-3 space-y-1 text-sm text-ink">
                  <p>{contact.email || "No email"}</p>
                  <p>{contact.linkedin_url || "No LinkedIn URL"}</p>
                  {contact.notes ? <p className="text-muted">{contact.notes}</p> : null}
                </div>
              </article>
            ))}
            {contacts.length === 0 ? <p className="text-sm text-muted">No contacts yet.</p> : null}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
        <div className="mb-6 space-y-2">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            Timeline
          </p>
          <h2 className="font-serif-ui text-3xl leading-none tracking-tight text-ink">
            Status history
          </h2>
        </div>

        <div className="space-y-3">
          {statusHistory.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2 rounded-[22px] border border-line bg-canvas px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-serif-ui text-2xl leading-none tracking-tight text-ink">
                  {formatEnumLabel(entry.from_status)} to {formatEnumLabel(entry.to_status)}
                </p>
                <p className="mt-2 font-mono-ui text-xs uppercase tracking-[0.16em] text-muted">
                  {entry.reason || "No reason"}
                </p>
              </div>
              <p className="font-mono-ui text-xs uppercase tracking-[0.16em] text-muted">
                {formatDate(entry.changed_at || entry.created_at)}
              </p>
            </div>
          ))}
          {statusHistory.length === 0 ? (
            <p className="text-sm text-muted">No status history yet.</p>
          ) : null}
        </div>
      </section>
    </section>
  );
}
