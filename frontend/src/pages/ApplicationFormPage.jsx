import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createApplication, getApplication, updateApplication } from "../lib/api";
import {
  APPLICATION_PRIORITIES,
  APPLICATION_STATUSES,
  EMPTY_APPLICATION_FORM,
  WORK_SETUPS,
  formatEnumLabel,
  toApplicationFormValues,
  toApplicationPayload,
} from "../lib/applicationModel";
import { useAuth } from "../state/AuthContext";

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function ApplicationFormPage() {
  const { token } = useAuth();
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const isEdit = useMemo(() => Boolean(applicationId), [applicationId]);
  const [form, setForm] = useState(EMPTY_APPLICATION_FORM);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    async function loadApplication() {
      if (!isEdit) {
        return;
      }
      try {
        const application = await getApplication(token, Number(applicationId));
        setForm(toApplicationFormValues(application));
      } catch (err) {
        setError(err.message || "Failed to load application.");
      } finally {
        setIsLoading(false);
      }
    }
    loadApplication();
  }, [applicationId, isEdit, token]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = toApplicationPayload(form);
      if (isEdit) {
        await updateApplication(token, {
          application_id: Number(applicationId),
          ...payload,
        });
        navigate(`/applications/${applicationId}`, { replace: true });
      } else {
        const created = await createApplication(token, payload);
        navigate(`/applications/${created.id}`, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Failed to save application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="py-16 text-sm text-muted">Loading application...</p>;
  }

  return (
    <section className="rounded-[28px] border border-line bg-white p-6 card-shadow">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            {isEdit ? "Edit Application" : "New Application"}
          </p>
          <h1 className="font-serif-ui text-4xl leading-none tracking-tight text-ink sm:text-5xl">
            {isEdit ? "Update this role." : "Add a new role."}
          </h1>
        </div>

        <Link
          to="/applications"
          className="rounded-full border border-line px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          Back to applications
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-4">
            <h2 className="font-serif-ui text-3xl leading-none tracking-tight text-ink">
              Role details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="company_name"
                  value={form.company_name}
                  onChange={onChange}
                  required
                />
              </Field>
              <Field label="Job Title">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="job_title"
                  value={form.job_title}
                  onChange={onChange}
                  required
                />
              </Field>
              <Field label="Job Post URL">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="job_post_url"
                  value={form.job_post_url}
                  onChange={onChange}
                />
              </Field>
              <Field label="Location">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                />
              </Field>
              <Field label="Work Setup">
                <select
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="work_setup"
                  value={form.work_setup}
                  onChange={onChange}
                >
                  {WORK_SETUPS.map((value) => (
                    <option key={value} value={value}>
                      {formatEnumLabel(value)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Source">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="source"
                  value={form.source}
                  onChange={onChange}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif-ui text-3xl leading-none tracking-tight text-ink">
              Status and follow-up
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <select
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="status"
                  value={form.status}
                  onChange={onChange}
                >
                  {APPLICATION_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {formatEnumLabel(value)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="priority"
                  value={form.priority}
                  onChange={onChange}
                >
                  {APPLICATION_PRIORITIES.map((value) => (
                    <option key={value} value={value}>
                      {formatEnumLabel(value)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Applied At">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  type="date"
                  name="applied_at"
                  value={form.applied_at}
                  onChange={onChange}
                />
              </Field>
              <Field label="Next Action">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  name="next_action"
                  value={form.next_action}
                  onChange={onChange}
                />
              </Field>
              <Field label="Next Action Due">
                <input
                  className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                  type="date"
                  name="next_action_due_at"
                  value={form.next_action_due_at}
                  onChange={onChange}
                />
              </Field>
            </div>
          </section>
        </div>

        <section className="space-y-4">
          <h2 className="font-serif-ui text-3xl leading-none tracking-tight text-ink">
            Compensation and materials
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Salary Min">
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                name="salary_min"
                type="number"
                value={form.salary_min}
                onChange={onChange}
              />
            </Field>
            <Field label="Salary Max">
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                name="salary_max"
                type="number"
                value={form.salary_max}
                onChange={onChange}
              />
            </Field>
            <Field label="Currency">
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                name="currency"
                value={form.currency}
                onChange={onChange}
              />
            </Field>
            <Field label="Resume Version">
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                name="resume_version"
                value={form.resume_version}
                onChange={onChange}
              />
            </Field>
            <Field label="Cover Letter Version">
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                name="cover_letter_version"
                value={form.cover_letter_version}
                onChange={onChange}
              />
            </Field>
          </div>
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            Keep the existing save behavior and validation intact.
          </p>
          <button
            className="rounded-full bg-neutral-900 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Application"}
          </button>
        </div>
      </form>
    </section>
  );
}
