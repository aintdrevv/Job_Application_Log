import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { changeApplicationStatus, deleteApplication, listApplications } from "../lib/api";
import { formatEnumLabel } from "../lib/applicationModel";
import { useAuth } from "../state/AuthContext";

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function SavedJobsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  async function loadSavedJobs() {
    try {
      const result = await listApplications(token);
      setApplications(Array.isArray(result) ? result : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load saved jobs.");
    }
  }

  useEffect(() => {
    loadSavedJobs();
  }, [token]);

  const savedJobs = useMemo(() => {
    const search = query.trim().toLowerCase();

    return applications
      .filter((item) => item.status === "draft")
      .filter((item) => {
        if (!search) {
          return true;
        }

        return [item.company_name, item.job_title, item.location, item.source]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));
      })
      .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
  }, [applications, query]);

  async function onDelete(jobId) {
    const ok = window.confirm("Delete this saved job?");
    if (!ok) {
      return;
    }

    try {
      await deleteApplication(token, jobId);
      setApplications((prev) => prev.filter((item) => item.id !== jobId));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete saved job.");
    }
  }

  async function onConvert(jobId) {
    try {
      await changeApplicationStatus(token, {
        application_id: jobId,
        to_status: "applied",
        reason: "converted_from_saved_jobs",
      });
      setApplications((prev) =>
        prev.map((item) =>
          item.id === jobId ? { ...item, status: "applied" } : item
        )
      );
      setError("");
    } catch (err) {
      setError(err.message || "Failed to convert saved job.");
    }
  }

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            Saved list
          </p>
          <h1 className="font-serif-ui text-4xl leading-none tracking-tight text-ink sm:text-5xl">
            Saved Jobs
          </h1>
          <p className="text-sm text-muted">
            Draft applications live here until you are ready to actually apply.
          </p>
        </div>

        <label className="space-y-2">
          <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            Search
          </span>
          <input
            className="w-full min-w-[240px] rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Company, role, location, source"
          />
        </label>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="space-y-3 lg:max-h-[calc(100vh-19rem)] lg:overflow-y-auto lg:pr-1">
        {savedJobs.map((job) => (
          <article
            key={job.id}
            className="grid gap-4 rounded-[24px] border border-line bg-white p-5 sm:grid-cols-[1.35fr_auto]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 sm:block">
                <div className="space-y-2">
                  <Link
                    to={`/applications/${job.id}`}
                    className="font-serif-ui text-3xl leading-none tracking-tight text-ink"
                  >
                    {job.company_name}
                  </Link>
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                    {job.job_title}
                  </p>
                </div>
                <p className="shrink-0 text-right font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted sm:hidden">
                  {formatDate(job.created_at)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-neutral-600">
                  Saved
                </span>
                <span className="rounded-full border border-line px-2.5 py-1 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted">
                  {job.location || "Location N/A"}
                </span>
                <span className="rounded-full border border-line px-2.5 py-1 font-mono-ui text-[9px] uppercase tracking-[0.14em] text-muted">
                  {job.source || "Source N/A"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:min-w-[390px] sm:justify-between sm:items-end">
              <p className="hidden w-full font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted sm:block sm:text-right">
                {formatDate(job.created_at)}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:flex-nowrap sm:justify-end">
                <button
                  type="button"
                  onClick={() => onConvert(job.id)}
                  className="shrink-0 rounded-full bg-neutral-900 px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
                >
                  Convert
                </button>
                <Link
                  to={`/applications/${job.id}`}
                  className="shrink-0 rounded-full border border-line px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  Open
                </Link>
                <Link
                  to={`/applications/${job.id}/edit`}
                  className="shrink-0 rounded-full border border-line px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(job.id)}
                  className="shrink-0 rounded-full border border-red-200 px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-red-700 transition hover:border-red-300 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}

        {savedJobs.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-line px-5 py-8 text-sm text-muted">
            No saved jobs yet. Create a draft application to keep a role here before you apply.
          </div>
        ) : null}
      </div>
    </section>
  );
}
