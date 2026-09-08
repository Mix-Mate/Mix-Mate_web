import { INPUT_VALIDATION_RULES } from "@/shared/lib/input-validation";

export interface UpdateUserNameResponse {
  userName: string;
  message?: string;
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
 * 백엔드 배포 전 Mocking: 0.5초(500ms) 딜레이 후 성공 응답 반환
 *
 * 실제 연동 시:
 * 아래 주석 해제하여 PATCH /api/v1/users/me 호출로 전환
 */
export async function updateUserNameApi(
  newName: string,
): Promise<UpdateUserNameResponse> {
  const validationError = validateUserName(newName);
  if (validationError) {
    throw new Error(validationError);
  }

  const trimmed = newName.trim();

  // Mock delay: 500ms
  await new Promise((resolve) => setTimeout(resolve, 500));

  /*
  // [실제 백엔드 API 연동용 코드 - 배포 후 상단에 apiFetch, API_BASE_URL import 후 주석 해제]
  // import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
  // import { apiFetch } from "@/shared/api/apiFetch";
  const response = await apiFetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userName: trimmed }),
  });

  if (!response.ok) {
    let errorMessage = "이름 변경에 실패했습니다.";
    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData?.message) errorMessage = errorData.message;
    } catch {
      // Non-JSON response fallback
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as UpdateUserNameResponse;
  */

  return {
    userName: trimmed,
    message: "이름이 성공적으로 변경되었습니다.",
  };
}
