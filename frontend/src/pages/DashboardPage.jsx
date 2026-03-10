import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listApplications } from "../lib/api";
import { formatEnumLabel } from "../lib/applicationModel";
import { useAuth } from "../state/AuthContext";

function formatDate(value) {
  if (!value) return "No date";
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

const EMPTY_MESSAGES = {
  total: "No applications yet. Start tracking! 🚀",
  interviewing: "Nothing in process yet. Keep applying! 💪",
  offers: "No offers yet. You got this! 🎯",
  rejected: "No rejections yet. 🙌",
};

export default function DashboardPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await listApplications(token);
        setApplications(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      }
    }
    load();
  }, [token]);

  const metrics = useMemo(() => {
    const total = applications;
    const interviewing = applications.filter((item) =>
      ["screening", "interviewing", "final_interview"].includes(item.status)
    );
    const offers = applications.filter((item) => item.status === "offer");
    const rejected = applications.filter((item) => item.status === "rejected");
    return { total, interviewing, offers, rejected };
  }, [applications]);

  const tabs = [
    { key: "total", label: "Total", items: metrics.total },
    { key: "interviewing", label: "In Process", items: metrics.interviewing },
    { key: "offers", label: "Offers", items: metrics.offers },
    { key: "rejected", label: "Rejected", items: metrics.rejected },
  ];

  function handleTab(key) {
    setActiveTab(activeTab === key ? null : key);
  }

  const activeItems = tabs.find((t) => t.key === activeTab)?.items || [];

  return (
    <section className="space-y-5">

      {/* MOBILE STAT TABS */}
      <div className="block sm:hidden rounded-[24px] border border-line bg-white card-shadow overflow-hidden">
        {/* Tab labels row */}
        <div className="grid grid-cols-4 border-b border-line">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTab(tab.key)}
              className={`py-4 px-1 text-center transition-all ${
                activeTab === tab.key
                  ? "bg-ink text-white"
                  : "bg-white text-muted"
              }`}
            >
              <span className="font-mono-ui text-[9px] uppercase tracking-[0.15em] leading-tight block">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Expandable panel */}
        {activeTab && (
          <div className="w-full animate-fadeIn">
            {/* Count */}
            <div className="px-6 pt-5 pb-3 border-b border-line">
              <h2 className="font-mono-ui text-5xl font-semibold tracking-tight text-ink">
                {activeItems.length}
              </h2>
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted mt-1">
                {tabs.find((t) => t.key === activeTab)?.label}
              </p>
            </div>

            {/* List */}
            <div className="divide-y divide-line">
              {activeItems.length === 0 ? (
                <p className="px-6 py-6 font-mono-ui text-xs text-muted text-center">
                  {EMPTY_MESSAGES[activeTab]}
                </p>
              ) : (
                activeItems.map((app) => (
                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition"
                  >
                    <div>
                      <p className="font-serif-ui text-xl leading-none text-ink">
                        {app.company_name}
                      </p>
                      <p className="font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted mt-1">
                        {app.job_title}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${statusClass(app.status)}`}
                    >
                      {formatEnumLabel(app.status)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP STAT CARDS — unchanged */}
      <div className="hidden sm:grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tabs.map((tab) => (
          <article
            key={tab.key}
            className="rounded-[24px] border border-line bg-white p-5 card-shadow"
          >
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              {tab.label}
            </p>
            <h2 className="mt-4 font-mono-ui text-4xl font-semibold tracking-tight text-ink">
              {tab.items.length}
            </h2>
          </article>
        ))}
      </div>

      {/* LATEST APPLICATIONS — unchanged */}
      <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              Recent activity
            </p>
            <h2 className="font-serif-ui text-4xl leading-none tracking-tight text-ink">
              Latest Applications
            </h2>
          </div>
          <Link
            to="/applications"
            className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-neutral-900 underline underline-offset-4"
          >
            View all
          </Link>
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.3fr_1.1fr_0.8fr_0.8fr] border-b border-line pb-3 font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              <span>Company</span>
              <span>Role</span>
              <span>Status</span>
              <span>Created</span>
            </div>

            <div className="divide-y divide-line">
              {applications.slice(0, 5).map((application) => (
                <Link
                  key={application.id}
                  to={`/applications/${application.id}`}
                  className="grid grid-cols-[1.3fr_1.1fr_0.8fr_0.8fr] items-center gap-4 py-4 text-sm transition hover:bg-neutral-50"
                >
                  <span className="font-serif-ui text-2xl leading-none text-ink">
                    {application.company_name}
                  </span>
                  <span className="font-mono-ui text-xs uppercase tracking-[0.14em] text-muted">
                    {application.job_title}
                  </span>
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${statusClass(application.status)}`}
                  >
                    {formatEnumLabel(application.status)}
                  </span>
                  <span className="font-mono-ui text-xs uppercase tracking-[0.14em] text-muted">
                    {formatDate(application.created_at)}
                  </span>
                </Link>
              ))}
            </div>

            {applications.length === 0 ? (
              <p className="py-8 text-sm text-muted">No applications yet.</p>
            ) : null}
          </div>
        </div>
      </section>
    </section>
  );
}
