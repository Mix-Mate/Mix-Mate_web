import { API_BASE_URL } from "@/shared/api/apiBaseUrl";

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

