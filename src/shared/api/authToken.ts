// TODO(auth-integration): FE1이 로그인 흐름과 토큰 저장 방식을 구현하면
// 실제 저장 키에 맞춰 이 파일만 수정하면 되도록 토큰 조회를 여기 한 곳에 모아둔다.
export const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

const TOKEN_STORAGE_KEYS = [ACCESS_TOKEN_STORAGE_KEY, "access_token", "token"];

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_STORAGE_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;

  for (const key of TOKEN_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export function withAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getAccessToken();
  if (!token) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}
