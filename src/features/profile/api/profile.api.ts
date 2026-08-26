import type {
  MyGroupProfile,
  MyProfileResponse,
  ParticipantProfileRequest,
} from "../types/profile.types";
import { createApiRequestError } from "@/shared/api/apiError";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";

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
    throw await createApiRequestError(
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
      headers: withAuthHeaders({
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(profile),
    },
  );

  if (!response.ok) {
    throw await createApiRequestError(
      response,
      "프로필 수정에 실패했습니다.",
    );
  }
}

export async function leaveGroup(groupId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/participants/me`,
    {
      method: "DELETE",
      credentials: "include",
      headers: withAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw await createApiRequestError(response, "그룹 탈퇴에 실패했습니다.");
  }
}
