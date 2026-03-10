export const APPLICATION_STATUSES = [
  "draft",
  "applied",
  "screening",
  "interviewing",
  "final_interview",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
];

export const APPLICATION_PRIORITIES = ["low", "medium", "high"];
export const WORK_SETUPS = ["onsite", "hybrid", "remote", "unknown"];
export const NOTE_TYPES = ["general", "interview", "followup", "reminder"];

export const EMPTY_APPLICATION_FORM = {
  company_name: "",
  job_title: "",
  job_post_url: "",
  location: "",
  work_setup: "unknown",
  salary_min: "",
  salary_max: "",
  currency: "USD",
  applied_at: "",
  status: "applied",
  priority: "medium",
  source: "",
  resume_version: "",
  cover_letter_version: "",
  next_action: "",
  next_action_due_at: "",
};

export function formatEnumLabel(value) {
  if (!value) {
    return "-";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSalaryRange(application) {
  const min = application?.salary_min;
  const max = application?.salary_max;
  const currency = application?.currency || "USD";

  if (min == null && max == null) {
    return "Not set";
  }

  const formatMoney = (value) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  if (min != null && max != null) {
    return `${formatMoney(min)} - ${formatMoney(max)}`;
  }

  if (min != null) {
    return `${formatMoney(min)}+`;
  }

  return `Up to ${formatMoney(max)}`;
}

export function toApplicationPayload(form) {
  return {
    ...form,
    salary_min: form.salary_min === "" ? null : Number(form.salary_min),
    salary_max: form.salary_max === "" ? null : Number(form.salary_max),
    applied_at: form.applied_at || null,
    next_action_due_at: form.next_action_due_at || null,
  };
}

export function toApplicationFormValues(application) {
  return {
    company_name: application.company_name || "",
    job_title: application.job_title || "",
    job_post_url: application.job_post_url || "",
    location: application.location || "",
    work_setup: application.work_setup || "unknown",
    salary_min: application.salary_min ?? "",
    salary_max: application.salary_max ?? "",
    currency: application.currency || "USD",
    applied_at: toDateInput(application.applied_at),
    status: application.status || "applied",
    priority: application.priority || "medium",
    source: application.source || "",
    resume_version: application.resume_version || "",
    cover_letter_version: application.cover_letter_version || "",
    next_action: application.next_action || "",
    next_action_due_at: toDateInput(application.next_action_due_at),
  };
}

function toDateInput(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}
