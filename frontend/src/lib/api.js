function getApiHost() {
  const fullBaseUrl = import.meta.env.VITE_XANO_BASE_URL;
  if (fullBaseUrl) {
    const marker = "/api:";
    const markerIndex = fullBaseUrl.indexOf(marker);
    if (markerIndex > -1) {
      return fullBaseUrl.slice(0, markerIndex);
    }
    return fullBaseUrl;
  }

  const apiHost = import.meta.env.VITE_XANO_API_HOST;
  if (!apiHost) {
    throw new Error("Missing Xano config: set VITE_XANO_API_HOST.");
  }
  return apiHost;
}

function getApiGroup(kind) {
  const defaultGroup = import.meta.env.VITE_XANO_API_GROUP;
  const authGroup = import.meta.env.VITE_XANO_API_GROUP_AUTH;
  const applicationsGroup = import.meta.env.VITE_XANO_API_GROUP_APPLICATIONS;
  if (kind === "auth") {
    return authGroup || defaultGroup;
  }
  if (kind === "applications") {
    return applicationsGroup || defaultGroup;
  }
  return defaultGroup;
}

function getApiBaseUrl(kind) {
  const host = getApiHost();
  const group = getApiGroup(kind);
  if (!group) {
    throw new Error(
      "Missing Xano API group config: set VITE_XANO_API_GROUP or feature-specific group vars."
    );
  }
  return `${host}/api:${group}`;
}

function getAuthBaseUrl() {
  return getApiBaseUrl("auth");
}

function getApplicationsBaseUrl() {
  return getApiBaseUrl("applications");
}

function buildHeaders(token, hasBody = false) {
  const headers = {};
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

function withQuery(path, query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function login(payload) {
  return request(getAuthBaseUrl(), "/auth/login", {
    method: "POST",
    headers: buildHeaders(null, true),
    body: JSON.stringify(payload),
  });
}

export async function signup(payload) {
  return request(getAuthBaseUrl(), "/auth/signup", {
    method: "POST",
    headers: buildHeaders(null, true),
    body: JSON.stringify(payload),
  });
}

export async function getMe(token) {
  return request(getAuthBaseUrl(), "/auth/me", {
    method: "GET",
    headers: buildHeaders(token),
  });
}

export async function listApplications(token) {
  return request(getApplicationsBaseUrl(), "/applications", {
    method: "GET",
    headers: buildHeaders(token),
  });
}

export async function createApplication(token, payload) {
  return request(getApplicationsBaseUrl(), "/applications", {
    method: "POST",
    headers: buildHeaders(token, true),
    body: JSON.stringify(payload),
  });
}

export async function getApplication(token, applicationId) {
  return request(
    getApplicationsBaseUrl(),
    withQuery("/application/get", { application_id: applicationId }),
    {
      method: "GET",
      headers: buildHeaders(token),
    }
  );
}

export async function updateApplication(token, payload) {
  return request(getApplicationsBaseUrl(), "/application/update", {
    method: "PATCH",
    headers: buildHeaders(token, true),
    body: JSON.stringify(payload),
  });
}

export async function deleteApplication(token, applicationId) {
  return request(getApplicationsBaseUrl(), "/application/delete", {
    method: "DELETE",
    headers: buildHeaders(token, true),
    body: JSON.stringify({ application_id: applicationId }),
  });
}

export async function listApplicationNotes(token, applicationId) {
  return request(
    getApplicationsBaseUrl(),
    withQuery("/application/notes", { application_id: applicationId }),
    {
      method: "GET",
      headers: buildHeaders(token),
    }
  );
}

export async function createApplicationNote(token, payload) {
  return request(getApplicationsBaseUrl(), "/application/notes", {
    method: "POST",
    headers: buildHeaders(token, true),
    body: JSON.stringify(payload),
  });
}

export async function listApplicationContacts(token, applicationId) {
  return request(
    getApplicationsBaseUrl(),
    withQuery("/application/contacts", { application_id: applicationId }),
    {
      method: "GET",
      headers: buildHeaders(token),
    }
  );
}

export async function createApplicationContact(token, payload) {
  return request(getApplicationsBaseUrl(), "/application/contacts", {
    method: "POST",
    headers: buildHeaders(token, true),
    body: JSON.stringify(payload),
  });
}

export async function listApplicationStatusHistory(token, applicationId) {
  return request(
    getApplicationsBaseUrl(),
    withQuery("/application/status-history", { application_id: applicationId }),
    {
      method: "GET",
      headers: buildHeaders(token),
    }
  );
}

export async function changeApplicationStatus(token, payload) {
  return request(getApplicationsBaseUrl(), "/application/status-change", {
    method: "POST",
    headers: buildHeaders(token, true),
    body: JSON.stringify(payload),
  });
}
