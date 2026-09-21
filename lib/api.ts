import type { User } from "@/shared/catalog";
export const API_URL =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_API_URL || "";
let token = "";
try {
  token = sessionStorage.getItem("st-session") || "";
} catch {}
export function getToken() {
  return token;
}
export function setToken(value: string) {
  token = value;
  try {
    value
      ? sessionStorage.setItem("st-session", value)
      : sessionStorage.removeItem("st-session");
  } catch {}
}
export async function api<T>(
  path: string,
  body?: unknown,
  method?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    method: method || (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 204) return undefined as T;
  const data = (await response
    .json()
    .catch(() => ({
      error: "Service is unavailable. Please try again later.",
    }))) as { error?: string };
  if (!response.ok)
    throw new Error(data.error || "Unable to complete this request.");
  return data as T;
}
export type AuthResult = { token: string; user: User };
