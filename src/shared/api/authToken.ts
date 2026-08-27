const ACCESS_TOKEN_KEYS = ["accessToken", "access_token", "token"];
const REFRESH_TOKEN_KEYS = ["refreshToken", "refresh_token"];
const USER_INFO_KEYS = ["userName", "userId", "email", "user"];

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of ACCESS_TOKEN_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of REFRESH_TOKEN_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

export interface SetAuthTokensParams {
  accessToken: string;
  refreshToken?: string;
}

export function setAuthTokens({
  accessToken,
  refreshToken,
}: SetAuthTokensParams): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("accessToken", accessToken);
  document.cookie = `accessToken=${accessToken}; path=/; SameSite=Lax`;

  if (refreshToken) {
    window.localStorage.setItem("refreshToken", refreshToken);
    document.cookie = `refreshToken=${refreshToken}; path=/; SameSite=Lax`;
  }
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;

  [...ACCESS_TOKEN_KEYS, ...REFRESH_TOKEN_KEYS, ...USER_INFO_KEYS].forEach(
    (key) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    },
  );

  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function withAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getAccessToken();
  if (!token) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}
