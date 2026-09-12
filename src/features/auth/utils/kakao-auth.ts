export const KAKAO_CLIENT_ID = "5e87cbddeabf737c653ff55ba180c19c";
export const KAKAO_OAUTH_STATE_KEY = "kakao_oauth_state";

export function getKakaoRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/oauth/kakao/callback`;
}

export function generateRandomState(): string {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function getKakaoAuthorizeUrl(state: string): string {
  const redirectUri = getKakaoRedirectUri();
  const params = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export function redirectToKakaoLogin(): void {
  if (typeof window === "undefined") return;

  const state = generateRandomState();
  window.sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state);

  window.location.href = getKakaoAuthorizeUrl(state);
}
