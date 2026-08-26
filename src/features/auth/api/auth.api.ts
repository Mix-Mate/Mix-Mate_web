import { API_BASE_URL } from "@/shared/api/apiBaseUrl";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
  email: string;
  userName: string;
  accessToken: string;
  refreshToken: string;
};

async function getErrorMessage(response: Response) {
  try {
    const errorBody = (await response.json()) as { message?: string };
    return errorBody.message ?? "로그인에 실패했습니다.";
  } catch {
    return "로그인에 실패했습니다.";
  }
}

export async function login(input: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<LoginResponse>;
}
