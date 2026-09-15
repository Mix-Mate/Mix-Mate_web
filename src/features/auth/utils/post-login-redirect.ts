export const POST_LOGIN_REDIRECT_KEY = "mixmate:post-login-redirect";

const REDIRECT_BASE_URL = "https://mixmate.local";

export function normalizePostLoginRedirect(
  candidate: string | null | undefined,
): string | null {
  if (!candidate || candidate !== candidate.trim()) return null;
  if (!candidate.startsWith("/") || /^\/[\\/]/.test(candidate)) return null;

  try {
    const url = new URL(candidate, REDIRECT_BASE_URL);
    if (url.origin !== REDIRECT_BASE_URL) return null;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function rememberPostLoginRedirect(
  candidate: string | null | undefined,
): string | null {
  const redirect = normalizePostLoginRedirect(candidate);

  if (typeof window !== "undefined") {
    if (redirect) {
      window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirect);
    } else {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    }
  }

  return redirect;
}

export function getPostLoginRedirect(): string | null {
  if (typeof window === "undefined") return null;

  return normalizePostLoginRedirect(
    window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY),
  );
}

export function consumePostLoginRedirect(
  candidate?: string | null,
): string | null {
  const redirect =
    candidate === undefined || candidate === null
      ? getPostLoginRedirect()
      : normalizePostLoginRedirect(candidate);

  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  }

  return redirect;
}
