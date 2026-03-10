import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { changeApplicationStatus, listApplications } from "../lib/api";
import { APPLICATION_STATUSES, formatEnumLabel } from "../lib/applicationModel";
import { useAuth } from "../state/AuthContext";

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

function getDisplayDate(application) {
  return application.applied_at || application.created_at || null;
}

function formatDate(value, withYear = true) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(value));
}

function formatMonth(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function ApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [error, setError] = useState("");

  async function loadApplications() {
    try {
      const result = await listApplications(token);
      setApplications(Array.isArray(result) ? result : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load applications.");
    }
  }

  useEffect(() => {
    loadApplications();
  }, [token]);

  const statusGroups = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "active", label: "Active" },
    { key: "offer", label: "Offer" },
    { key: "rejected", label: "Rejected" },
  ];

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...applications]
      .filter((app) => {
        if (statusFilter === "draft" && app.status !== "draft") {
          return false;
        }

        if (
          statusFilter === "active" &&
          !["screening", "interviewing", "final_interview", "applied"].includes(app.status)
        ) {
          return false;
        }

        if (statusFilter === "offer" && app.status !== "offer") {
          return false;
        }

        if (
          statusFilter === "rejected" &&
          !["rejected", "ghosted", "withdrawn"].includes(app.status)
        ) {
          return false;
        }

        if (!search) {
          return true;
        }

        return [
          app.company_name,
          app.job_title,
          app.location,
          app.source,
          app.next_action,
          app.priority,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));
      })
      .sort((left, right) => {
        const leftDate = getDisplayDate(left);
        const rightDate = getDisplayDate(right);

        if (!leftDate && !rightDate) {
          return String(left.company_name || "").localeCompare(String(right.company_name || ""));
        }

        if (!leftDate) {
          return 1;
        }

        if (!rightDate) {
          return -1;
        }

        return new Date(rightDate) - new Date(leftDate);
      });
  }, [applications, query, statusFilter]);

  const timelineGroups = useMemo(() => {
    return filtered.reduce((groups, application) => {
      const key = formatMonth(getDisplayDate(application));

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(application);
      return groups;
    }, {});
  }, [filtered]);

  const onStatusChange = async (applicationId, toStatus) => {
    try {
      await changeApplicationStatus(token, {
        application_id: applicationId,
        to_status: toStatus,
        reason: "updated_from_list",
      });
      await loadApplications();
    } catch (err) {
      setError(err.message || "Failed to update status.");
    }
  };

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
      <div className="mb-6 flex flex-col gap-6">
        <div className="space-y-2">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            Pipeline
          </p>
          <h1 className="font-serif-ui text-4xl leading-none tracking-tight text-ink sm:text-5xl">
            Applications
          </h1>
          <p className="text-sm text-muted">
            Search by company, role, source, priority, or next action.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <label className="space-y-2 lg:w-[340px] lg:shrink-0">
              <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                Search
              </span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Company, role, source, or next action"
              />
            </label>

            <div className="space-y-2 lg:w-[340px] lg:shrink-0">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                Status
              </p>
              <select
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {statusGroups.map((status) => (
                  <option key={status.key} value={status.key}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>

        <div className="inline-flex rounded-full border border-line bg-canvas p-1">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`rounded-full px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
              viewMode === "cards"
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Card view
          </button>
          <button
            type="button"
            onClick={() => setViewMode("timeline")}
            className={`rounded-full px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
              viewMode === "timeline"
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Timeline view
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {viewMode === "cards" ? (
        <div className="space-y-3">
          {filtered.map((application) => (
            <article
              key={application.id}
              className="grid gap-4 rounded-[24px] border border-line bg-white p-5 sm:grid-cols-[1.2fr_0.9fr]"
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <Link
                    to={`/applications/${application.id}`}
                    className="font-serif-ui text-3xl leading-none tracking-tight text-ink"
                  >
                    {application.company_name}
                  </Link>
                  <p className="font-mono-ui text-xs uppercase tracking-[0.16em] text-muted">
                    {application.job_title}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${statusClass(application.status)}`}
                  >
                    {formatEnumLabel(application.status)}
                  </span>
                  <span className="rounded-full border border-line px-3 py-1 font-mono-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {application.priority || "medium"}
                  </span>
                  <span className="rounded-full border border-line px-3 py-1 font-mono-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {application.location || "Location N/A"}
                  </span>
                  <span className="rounded-full border border-line px-3 py-1 font-mono-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {formatDate(getDisplayDate(application))}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <label className="w-full space-y-2 sm:max-w-[220px]">
                  <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                    Update status
                  </span>
                  <select
                    className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                    value={application.status || "draft"}
                    onChange={(event) => onStatusChange(application.id, event.target.value)}
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatEnumLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Link
                    className="rounded-full border border-line px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    to={`/applications/${application.id}`}
                  >
                    Open
                  </Link>
                  <Link
                    className="rounded-full border border-line px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                    to={`/applications/${application.id}/edit`}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(timelineGroups).map(([month, items]) => (
            <section key={month} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="font-serif-ui text-3xl leading-none tracking-tight text-ink">
                  {month}
                </h2>
                <div className="h-px flex-1 bg-line" />
              </div>

              <div className="relative space-y-4 pl-6 before:absolute before:bottom-0 before:left-[10px] before:top-1 before:w-px before:bg-line">
                {items.map((application) => (
                  <article
                    key={application.id}
                    className="relative rounded-[24px] border border-line bg-white p-5"
                  >
                    <span className="absolute -left-[22px] top-6 h-3 w-3 rounded-full border border-neutral-900 bg-white" />
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                          {formatDate(getDisplayDate(application))}
                        </p>
                        <div className="space-y-2">
                          <Link
                            to={`/applications/${application.id}`}
                            className="font-serif-ui text-3xl leading-none tracking-tight text-ink"
                          >
                            {application.company_name}
                          </Link>
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

                      <div className="flex w-full flex-col gap-3 lg:max-w-[240px] lg:items-end">
                        <label className="w-full space-y-2">
                          <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                            Update status
                          </span>
                          <select
                            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                            value={application.status || "draft"}
                            onChange={(event) => onStatusChange(application.id, event.target.value)}
                          >
                            {APPLICATION_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {formatEnumLabel(status)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <Link
                            className="rounded-full border border-line px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                            to={`/applications/${application.id}`}
                          >
                            Open
                          </Link>
                          <Link
                            className="rounded-full border border-line px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                            to={`/applications/${application.id}/edit`}
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-[24px] border border-dashed border-line px-5 py-8 text-sm text-muted">
          No applications found.
        </p>
      ) : null}
    </section>
  );
}
