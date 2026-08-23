// Camada única de comunicação com a API.
// Centraliza a URL base, o token JWT e o tratamento de erros.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const TOKEN_KEY = "bv_token";
const USER_KEY = "bv_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function storeSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Sessão expirou: limpa e volta para o login
  if (res.status === 401 && token) {
    clearSession();
    window.location.href = "/";
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "Algo deu errado. Tente novamente.");
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getClients: () => request("/api/clients"),
  createClient: (data) =>
    request("/api/clients", { method: "POST", body: JSON.stringify(data) }),
  updateClient: (id, data) =>
    request(`/api/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteClient: (id) => request(`/api/clients/${id}`, { method: "DELETE" }),

  getServices: () => request("/api/services"),

  getAppointments: () => request("/api/appointments"),
  createAppointment: (data) =>
    request("/api/appointments", { method: "POST", body: JSON.stringify(data) }),
  updateAppointment: (id, data) =>
    request(`/api/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, status) =>
    request(`/api/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteAppointment: (id) => request(`/api/appointments/${id}`, { method: "DELETE" }),
};
