const TOKEN_STORAGE_KEYS = ["accessToken", "access_token", "token"];
const REFRESH_TOKEN_STORAGE_KEYS = ["refreshToken", "refresh_token"];

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_STORAGE_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

export function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
}): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("accessToken", tokens.accessToken);
  if (tokens.refreshToken) {
    window.localStorage.setItem("refreshToken", tokens.refreshToken);
  }

  document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=86400; SameSite=Lax`;
  if (tokens.refreshToken) {
    document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;

  for (const key of [...TOKEN_STORAGE_KEYS, ...REFRESH_TOKEN_STORAGE_KEYS, "user", "userName", "userId"]) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }

  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax";
}

export function withAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getAccessToken();
  if (!token) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}
