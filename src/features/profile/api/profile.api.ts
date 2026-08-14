import type { ParticipantProfileRequest } from "../types/profile.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://mixmate.duckdns.org";

const authTokenKeys = ["accessToken", "access_token", "token"];

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of authTokenKeys) {
    const token = window.localStorage.getItem(key);
    if (token) return token;
  }

  return null;
}

async function getErrorMessage(response: Response) {
  try {
    const errorBody = (await response.json()) as { message?: string };
    return errorBody.message ?? "프로필 수정에 실패했습니다.";
  } catch {
    return "프로필 수정에 실패했습니다.";
  }
}

export async function updateParticipantProfile(
  groupId: string,
  profile: ParticipantProfileRequest,
) {
  const token = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/participants/me`,
    {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(profile),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}
