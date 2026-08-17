// TODO(auth-integration): FE1이 로그인 흐름과 토큰 저장 방식을 구현하면
// 실제 저장 키에 맞춰 이 파일만 수정하면 되도록 토큰 조회를 여기 한 곳에 모아둔다.
const TOKEN_STORAGE_KEYS = ["accessToken", "access_token", "token"];

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_STORAGE_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

export function withAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getAccessToken();
  if (!token) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}
