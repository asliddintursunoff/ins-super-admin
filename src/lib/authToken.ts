// src/lib/authToken.ts
import { clearToken, getToken, setToken } from "./token";

// Backwards-compatible helpers (old code might import these)
export function setAuthToken(token: string) {
  setToken(token);
}

export function clearAuthToken() {
  clearToken();
}

export function getAuthTokenFromDocument(): string | null {
  // keep the same function name that api.ts imports
  return getToken();
}
