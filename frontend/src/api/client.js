const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail;
    if (Array.isArray(detail)) {
      const message = detail
        .map((item) => `${item.loc?.slice(-1)?.[0] || "field"}: ${item.msg}`)
        .join(", ");
      throw new Error(message || "Request failed");
    }
    throw new Error(detail || raw || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  getProfile: () => request("/profile/me"),
  updateProfile: (payload) => request("/profile/me", { method: "PUT", body: JSON.stringify(payload) }),
  listQuestionSets: () => request("/question-sets"),
  getQuestionSet: (id) => request(`/question-sets/${id}`),
  generateQuestionSet: (payload) =>
    request("/question-sets/generate", { method: "POST", body: JSON.stringify(payload) }),
  startAttempt: (payload) => request("/attempts", { method: "POST", body: JSON.stringify(payload) }),
  getAttempts: () => request("/attempts"),
  getAttempt: (id) => request(`/attempts/${id}`),
  submitAttempt: (id, payload) =>
    request(`/attempts/${id}/submit`, { method: "POST", body: JSON.stringify(payload) }),
  getCertificate: (id) => request(`/attempts/${id}/certificate`)
};
