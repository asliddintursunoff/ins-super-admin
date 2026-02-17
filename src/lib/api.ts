// src/lib/api.ts
import type { AcademicYear, Program } from "./constants";
import type { MatrixResponse, SuperUserOut, TokenResponse } from "./types";
import { clearToken, getToken } from "./token";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const BASE = RAW_BASE.replace(/\/+$/, ""); // remove trailing /

function isHtml(text: string) {
  return text.trim().startsWith("<") || text.toLowerCase().includes("<!doctype html");
}

async function safeReadJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();

  if (!text.trim()) {
    // empty body (e.g., 204 No Content)
    return {} as T;
  }

  if (isHtml(text)) {
    throw new Error(
      `Invalid JSON response (server returned HTML). Check NEXT_PUBLIC_API_BASE_URL and route.\n\n${text.slice(0, 250)}...`
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response:\n\n${text.slice(0, 250)}...`);
  }
}

async function request(path: string, init?: RequestInit) {
  if (!BASE) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in .env.local");

  const headers = new Headers(init?.headers || {});
  const token = typeof window !== "undefined" ? getToken() : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  // If unauthorized, clear token so app can redirect to login cleanly
  if (res.status === 401) {
    if (typeof window !== "undefined") clearToken();
    throw new Error("Unauthorized (401). Please login again.");
  }

  if (!res.ok) {
    // try JSON error first
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => null);
      const detail =
        (data && typeof data === "object" && "detail" in data ? (data as any).detail : null) ?? null;
      throw new Error(detail ? JSON.stringify(detail) : `HTTP ${res.status}`);
    }

    const t = await res.text().catch(() => "");
    if (isHtml(t)) {
      throw new Error(`HTTP ${res.status} (server returned HTML). Check URL/route/proxy.`);
    }
    throw new Error(t || `HTTP ${res.status}`);
  }

  return res;
}

// --- Superuser auth ---
export async function superLogin(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const res = await request(`/superuser/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  return await safeReadJson<TokenResponse>(res);
}

export async function superMe() {
  const res = await request(`/superuser/me`);
  return await safeReadJson<SuperUserOut>(res);
}

export async function getSuperUsers() {
  const res = await request(`/superuser/super-users`);
  return await safeReadJson<SuperUserOut[]>(res);
}

export async function createSuperUser(payload: {
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  telegram_id?: string | null;
  is_root?: boolean;
}) {
  const res = await request(`/superuser/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await safeReadJson(res);
}

export async function deleteSuperUser(user_id: string) {
  const res = await request(`/superuser/super-user?user_id=${encodeURIComponent(user_id)}`, {
    method: "DELETE",
  });

  // backend may return empty body — that's fine
  const text = await res.text().catch(() => "");
  if (!text.trim()) return { ok: true };

  if (isHtml(text)) throw new Error("Delete returned HTML (wrong route/base URL).");

  try {
    return JSON.parse(text);
  } catch {
    return { ok: true };
  }
}

// --- Matrix ---
export async function getMatrix(program: Program, year: AcademicYear) {
  const res = await request(
    `/superuser/matrix?program=${encodeURIComponent(program)}&year=${encodeURIComponent(year)}`
  );
  return await safeReadJson<MatrixResponse>(res);
}

export async function downloadMatrixExcel(program: Program, year: AcademicYear) {
  const res = await request(
    `/superuser/matrix/excel?program=${encodeURIComponent(program)}&year=${encodeURIComponent(year)}`
  );

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `matrix_${program}_${year}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// --- CSV Rebase uploads ---
async function uploadCsv(path: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await request(path, { method: "POST", body: form });
  return await safeReadJson(res);
}

export const rebase = {
  subjects: (file: File) => uploadCsv("/subjects/rebase-with-csv", file),
  proffs: (file: File) => uploadCsv("/proffs/rebase-with-csv", file),
  groups: (file: File) => uploadCsv("/group/rebase-with-csv", file),
  classes: (file: File) => uploadCsv("/class/rebase-with-csv", file),
  users: (file: File) => uploadCsv("/user/rebase-with-csv", file),
};
