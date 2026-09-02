const ACCESS_TOKEN_KEYS = ["accessToken", "access_token", "token"];
const REFRESH_TOKEN_KEYS = ["refreshToken", "refresh_token"];
const USER_INFO_KEYS = ["userName", "userId", "email", "user"];

export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );

    let jsonStr: string;
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      const binaryStr = window.atob(padded);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      jsonStr = new TextDecoder().decode(bytes);
    } else if (typeof Buffer !== "undefined") {
      jsonStr = Buffer.from(padded, "base64").toString("utf-8");
    } else {
      return null;
    }

    return JSON.parse(jsonStr) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * 토큰 만료 여부 확인
 * - 토큰이 없거나 빈 문자열인 경우 만료(true)
 * - JWT 형식(3파트)인 경우 exp 필드를 디코딩하여 현재 시간과 비교
 * - 단순 모의 토큰(non-JWT)은 유효(false)로 취급
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token || !token.trim()) return true;

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    return true;
  }

  if (typeof payload.exp === "number") {
    return Date.now() >= payload.exp * 1000;
  }

  return false;
}

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
  document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

  if (refreshToken) {
    window.localStorage.setItem("refreshToken", refreshToken);
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
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

  document.cookie =
    "accessToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  document.cookie =
    "refreshToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

/**
 * 저장된 액세스 토큰의 유효성을 점검하고, 만료되었으면 스토리지를 클리어하고 false를 반환
 */
export function ensureValidAccessToken(): boolean {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    clearAuthTokens();
    return false;
  }
  return true;
}

export function withAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getAccessToken();
  if (!token) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}
