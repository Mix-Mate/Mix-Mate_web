import { API_BASE_URL } from "./apiBaseUrl";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  withAuthHeaders,
} from "./authToken";

interface TokenReissueResponse {
  accessToken?: string;
}

/**
 * 재발급은 한 번에 하나만 진행한다. 투표 현황 폴링처럼 여러 요청이 동시에
 * 401을 받는 상황에서 각자 재발급을 호출하면, 서버가 refreshToken을 회전시키는
 * 경우 서로의 토큰을 무효화해 전부 로그아웃되기 때문이다.
 */
let reissueInFlight: Promise<string | null> | null = null;

async function requestNewAccessToken(): Promise<string | null> {
  try {
    // refreshToken은 httpOnly 쿠키로도 내려오므로 쿠키만으로 재발급되는 것이
    // 정상 경로다. 쿠키를 못 쓰는 환경을 위해 저장된 값이 있으면 바디로도 보낸다.
    const refreshToken = getRefreshToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reissue`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as TokenReissueResponse;
    if (!data.accessToken) return null;

    setAuthTokens({ accessToken: data.accessToken });
    return data.accessToken;
  } catch {
    return null;
  }
}

/**
 * 새 accessToken을 발급받아 저장하고 반환한다. 실패하면 null.
 * SSE처럼 apiFetch를 태울 수 없는 연결에서도 같은 재발급 경로를 쓰도록 공개한다.
 */
export function reissueAccessToken(): Promise<string | null> {
  reissueInFlight ??= requestNewAccessToken().finally(() => {
    reissueInFlight = null;
  });

  return reissueInFlight;
}

/**
 * 인증이 필요한 API 호출에 쓰는 fetch 래퍼.
 *
 * - 저장된 accessToken을 Authorization 헤더로 붙인다.
 * - 401을 받으면 refreshToken으로 accessToken을 재발급받아 같은 요청을 한 번
 *   재시도한다. 재발급에 실패하면 저장된 토큰을 정리하고 원래의 401 응답을
 *   그대로 돌려주므로, 각 화면의 기존 401 처리(로그인 화면 이동 등)가 그대로
 *   동작한다.
 *
 * 인증 API(/api/v1/auth/*) 자체는 재발급 대상이 아니므로 이 래퍼를 쓰지 않는다.
 */
export async function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const sendRequest = () =>
    fetch(input, {
      ...init,
      credentials: "include",
      // 재시도 때 새 토큰이 실리도록 헤더는 매번 여기서 만든다.
      headers: withAuthHeaders(init.headers),
    });

  const accessTokenUsed = getAccessToken();
  const response = await sendRequest();
  if (response.status !== 401) return response;

  // 애초에 토큰 없이 보낸 요청이라면 만료가 아니라 비로그인이므로 재발급하지 않는다.
  if (!accessTokenUsed) return response;

  // 이 요청이 나가 있는 사이에 다른 요청이 이미 재발급을 끝냈다면, 또 재발급하지
  // 않고 새 토큰으로 바로 재시도한다. 재발급이 refreshToken을 회전시키는 서버에서
  // 불필요한 두 번째 재발급이 앞선 토큰을 무효화하는 것을 막는다.
  if (getAccessToken() !== accessTokenUsed) return sendRequest();

  const newAccessToken = await reissueAccessToken();
  if (!newAccessToken) {
    clearAuthTokens();
    return response;
  }

  return sendRequest();
}
