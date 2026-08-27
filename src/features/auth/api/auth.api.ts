import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders, clearAuthTokens } from "@/shared/api/authToken";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  userName: string;
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  userName: string;
}

export type SignupResponse = string | { message?: string; [key: string]: unknown };

export type LogoutResponse = string | { message?: string; [key: string]: unknown };

export interface AuthErrorResponse {
  code?: string;
  message?: string;
  errors?: Record<string, string>;
}

export class AuthApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    code?: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * 로그인 API 호출
 * POST /api/v1/auth/login
 */
export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON response fallback
    }

    const defaultMessage =
      response.status === 400
        ? "입력값이 올바르지 않습니다."
        : response.status === 401
          ? "이메일 또는 비밀번호가 일치하지 않습니다."
          : response.status === 404
            ? "사용자를 찾을 수 없습니다."
            : "로그인에 실패했습니다.";

    const message = errorData?.message || defaultMessage;

    throw new AuthApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  return (await response.json()) as LoginResponse;
}

/**
 * 회원가입 API 호출
 * POST /api/v1/auth/signup
 */
export async function signupApi(data: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON response fallback
    }

    const defaultMessage =
      response.status === 400
        ? "입력값이 올바르지 않습니다."
        : response.status === 409
          ? "이미 가입된 이메일입니다."
          : "회원가입에 실패했습니다.";

    const message = errorData?.message || defaultMessage;

    throw new AuthApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as SignupResponse;
  }
  return await response.text();
}

/**
 * 로그아웃 API 호출
 * POST /api/v1/auth/logout
 * 쿠키 기반 처리이므로 credentials: "include" 및 인증 헤더 포함
 */
export async function logoutApi(): Promise<LogoutResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON response fallback
    }

    const message = errorData?.message || "로그아웃에 실패했습니다.";

    throw new AuthApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as LogoutResponse;
  }
  return await response.text();
}

/**
 * 클라이언트 로그아웃 통합 핸들러
 * API 호출 성공 또는 에러 발생 여부와 상관없이 클라이언트에 남아있는 토큰 제거
 */
export async function performLogout(): Promise<void> {
  try {
    await logoutApi();
  } catch (error) {
    // 로그아웃 API 실패 시에도 클라이언트 토큰을 확실히 제거
    console.warn("Logout API returned error, proceeding to clear local tokens:", error);
  } finally {
    clearAuthTokens();
  }
}
