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

export type WithdrawResponse = string | { message?: string; [key: string]: unknown };

export interface WithdrawRequest {
  password: string;
}

export interface SendVerificationCodeParams {
  email: string;
}

export interface VerifyCodeParams {
  email: string;
  code: string;
}

export type AuthApiResponse = string | { message?: string; [key: string]: unknown };

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
 * 이메일 인증번호 발송 API
 * POST /api/v1/auth/send?email=...
 */
export async function sendVerificationCodeApi(
  params: SendVerificationCodeParams,
): Promise<AuthApiResponse> {
  const query = new URLSearchParams({ email: params.email.trim() }).toString();
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/send?${query}`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON fallback
    }

    const message =
      errorData?.message ||
      (response.status === 400
        ? "올바른 이메일 형식을 입력해 주세요."
        : response.status === 409
          ? "이미 가입된 이메일입니다."
          : "인증번호 발송에 실패했습니다.");

    throw new AuthApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as AuthApiResponse;
  }
  return await response.text();
}

/**
 * 이메일 인증번호 검증 API
 * POST /api/v1/auth/verify?email=...&code=...
 */
export async function verifyCodeApi(
  params: VerifyCodeParams,
): Promise<AuthApiResponse> {
  const query = new URLSearchParams({
    email: params.email.trim(),
    code: params.code.trim(),
  }).toString();
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify?${query}`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON fallback
    }

    const message =
      errorData?.message ||
      (response.status === 400
        ? "인증번호가 일치하지 않습니다."
        : response.status === 404
          ? "인증 요청을 찾을 수 없거나 만료되었습니다."
          : "인증번호 확인에 실패했습니다.");

    throw new AuthApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as AuthApiResponse;
  }
  return await response.text();
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
 * 회원탈퇴 API 호출
 * DELETE /api/v1/auth/withdraw
 */
export async function withdrawApi(
  data: WithdrawRequest,
): Promise<WithdrawResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/withdraw`, {
    method: "DELETE",
    credentials: "include",
    headers: withAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      password: data.password,
    }),
  });

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON fallback
    }

    const message = errorData?.message || "회원탈퇴에 실패했습니다.";

    throw new AuthApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as WithdrawResponse;
  }
  return await response.text();
}

/**
 * 클라이언트 로그아웃 통합 핸들러
 */
export async function performLogout(): Promise<void> {
  try {
    await logoutApi();
  } catch (error) {
    console.warn("Logout API returned error, proceeding to clear local tokens:", error);
  } finally {
    clearAuthTokens();
  }
}

/**
 * 클라이언트 회원탈퇴 통합 핸들러
 */
export async function performWithdraw(password: string): Promise<void> {
  await withdrawApi({ password });
  clearAuthTokens();
}

export interface SendPasswordResetCodeParams {
  email: string;
}

export interface VerifyPasswordResetCodeParams {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export type ResetPasswordResponse = string | { message?: string; [key: string]: unknown };

/**
 * 비밀번호 재설정 인증번호 발송 API
 * POST /api/v1/auth/password/send?email=...
 */
export async function sendPasswordResetCodeApi(
  params: SendPasswordResetCodeParams,
): Promise<AuthApiResponse> {
  const query = new URLSearchParams({ email: params.email.trim() }).toString();
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/password/send?${query}`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON fallback
    }

    const message =
      errorData?.message ||
      (response.status === 404
        ? "가입되지 않은 이메일입니다."
        : response.status === 400
          ? "올바른 이메일 형식을 입력해 주세요."
          : "인증번호 발송에 실패했습니다. 다시 시도해 주세요.");

    throw new AuthApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as AuthApiResponse;
  }
  return await response.text();
}

/**
 * 비밀번호 재설정 인증번호 검증 API
 * POST /api/v1/auth/password/verify?email=...&code=...
 */
export async function verifyPasswordResetCodeApi(
  params: VerifyPasswordResetCodeParams,
): Promise<AuthApiResponse> {
  const query = new URLSearchParams({
    email: params.email.trim(),
    code: params.code.trim(),
  }).toString();
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/password/verify?${query}`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON fallback
    }

    const message =
      errorData?.message ||
      (response.status === 400
        ? "인증번호가 올바르지 않거나 만료되었습니다."
        : response.status === 404
          ? "인증 요청을 찾을 수 없거나 만료되었습니다."
          : "인증번호 확인에 실패했습니다.");

    throw new AuthApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as AuthApiResponse;
  }
  return await response.text();
}

/**
 * 비밀번호 재설정 최종 변경 API
 * POST /api/v1/auth/password/reset
 */
export async function resetPasswordApi(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/password/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email: data.email.trim(),
      newPassword: data.newPassword,
    }),
  });

  if (!response.ok) {
    let errorData: AuthErrorResponse | null = null;
    try {
      errorData = (await response.json()) as AuthErrorResponse;
    } catch {
      // Non-JSON fallback
    }

    const defaultMessage =
      response.status === 400
        ? "이메일 인증이 완료되지 않았습니다."
        : response.status === 404
          ? "사용자를 찾을 수 없습니다."
          : "비밀번호 변경 중 오류가 발생했습니다.";

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
    return (await response.json()) as ResetPasswordResponse;
  }
  return await response.text();
}
