import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { apiFetch } from "@/shared/api/apiFetch";
import { INPUT_VALIDATION_RULES } from "@/shared/lib/input-validation";

export type UpdateUserNameResponse =
  | string
  | {
      userName?: string;
      message?: string;
      [key: string]: unknown;
    };

export interface UpdateUserNameErrorResponse {
  code?: string;
  message?: string;
  errors?: {
    userName?: string;
    [key: string]: string | undefined;
  };
}

export class UserApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: {
    userName?: string;
    [key: string]: string | undefined;
  };

  constructor(
    message: string,
    status: number,
    code?: string,
    fieldErrors?: {
      userName?: string;
      [key: string]: string | undefined;
    },
  ) {
    super(message);
    this.name = "UserApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * 사용자 이름(닉네임) 유효성 검사 헬퍼
 */
export function validateUserName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "이름을 입력해주세요.";
  }
  if (trimmed.length < 2 || trimmed.length > 10) {
    return "이름은 2자 이상 10자 이하로 입력해주세요.";
  }
  if (!INPUT_VALIDATION_RULES.userName.pattern.test(trimmed)) {
    return INPUT_VALIDATION_RULES.userName.characterMessage;
  }
  return null;
}

/**
 * 사용자 이름(닉네임) 변경 API
 * PATCH /api/v1/auth/name
 */
export async function updateUserNameApi(
  newName: string,
): Promise<UpdateUserNameResponse> {
  const validationError = validateUserName(newName);
  if (validationError) {
    throw new Error(validationError);
  }

  const trimmed = newName.trim();

  const response = await apiFetch(`${API_BASE_URL}/api/v1/auth/name`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userName: trimmed }),
  });

  if (!response.ok) {
    let errorData: UpdateUserNameErrorResponse | null = null;
    try {
      errorData = (await response.json()) as UpdateUserNameErrorResponse;
    } catch {
      // Non-JSON response fallback
    }

    const defaultMessage =
      response.status === 400
        ? "올바른 이름을 입력해주세요."
        : response.status === 401
          ? "인증이 필요합니다."
          : response.status === 404
            ? "사용자를 찾을 수 없습니다."
            : "이름 변경에 실패했습니다.";

    const message =
      errorData?.errors?.userName ||
      errorData?.message ||
      defaultMessage;

    throw new UserApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as UpdateUserNameResponse;
  }
  return await response.text();
}
