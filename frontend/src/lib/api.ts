const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem("gym-token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  return res.json();
}

export const apiGet = <T = unknown>(endpoint: string) => api<T>(endpoint);
export const apiPost = <T = unknown>(endpoint: string, body: unknown) =>
  api<T>(endpoint, { method: "POST", body });
export const apiPut = <T = unknown>(endpoint: string, body: unknown) =>
  api<T>(endpoint, { method: "PUT", body });
export const apiDelete = <T = unknown>(endpoint: string) =>
  api<T>(endpoint, { method: "DELETE" });
