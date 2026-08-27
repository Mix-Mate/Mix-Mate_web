import type {
  MyGroupProfile,
  MyProfileResponse,
  ParticipantProfileRequest,
} from "../types/profile.types";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";

async function createRequestError(response: Response, fallbackMessage: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return new Error(body.message ?? fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

export async function getMyGroupProfile(
  groupId: string,
): Promise<MyGroupProfile> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/participants/me`,
    {
      credentials: "include",
      headers: withAuthHeaders({
        Accept: "application/json",
      }),
    },
  );

  if (!response.ok) {
    throw await createRequestError(
      response,
      "내 프로필을 불러오지 못했습니다.",
    );
  }

  const data = (await response.json()) as MyProfileResponse;

  return {
    id: "me",
    ...data,
  };
}

export async function updateParticipantProfile(
  groupId: string,
  profile: ParticipantProfileRequest,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/participants/me`,
    {
      method: "PUT",
      credentials: "include",
      headers: withAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(profile),
    },
  );

  if (!response.ok) {
    throw await createRequestError(response, "프로필 수정에 실패했습니다.");
  }
}
