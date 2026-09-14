const GOOGLE_CLIENT_ID_PRODUCTION =
  "357004385324-mg23bcuh9akrai17k7v33qf0cdpea1tc.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID_LOCAL =
  "644513279062-mav753sfama6781cq3480jnu3onmmg4m.apps.googleusercontent.com";

export const GOOGLE_OAUTH_STATE_KEY = "google_oauth_state";

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

// 구글 정책상 운영 OAuth 클라이언트에 localhost를 리디렉션 URI로 등록할 수 없어
// 로컬 개발용 클라이언트를 별도로 발급받아 호스트 기준으로 분기한다.
export function getGoogleClientId(): string {
  if (typeof window === "undefined") return GOOGLE_CLIENT_ID_PRODUCTION;
  return isLocalHostname(window.location.hostname)
    ? GOOGLE_CLIENT_ID_LOCAL
    : GOOGLE_CLIENT_ID_PRODUCTION;
}

export function getGoogleRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/oauth/google/callback`;
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

export function getGoogleAuthorizeUrl(state: string): string {
  const redirectUri = getGoogleRedirectUri();
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function redirectToGoogleLogin(): void {
  if (typeof window === "undefined") return;

  const state = generateRandomState();
  window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);

  window.location.href = getGoogleAuthorizeUrl(state);
}
