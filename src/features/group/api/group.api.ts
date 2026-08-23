import type { GroupDetail, UpdateGroupInput } from "../types/group.types";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import { mockDelay } from "@/shared/api/mockDelay";

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getGroupDetail(groupId: string): Promise<GroupDetail> {
  const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
    credentials: "include",
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "그룹 정보를 불러오지 못했습니다."),
    );
  }

  return (await response.json()) as GroupDetail;
}

export async function closeRecruiting(groupId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/close-recruiting`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "참가자 모집 마감에 실패했습니다."),
    );
  }
}

export async function updateGroup(
  groupId: string,
  input: UpdateGroupInput,
) {
  await mockDelay();

  return {
    id: groupId,
    ...input,
  };
}

export async function deleteGroup(groupId: string) {
  void groupId;
  await mockDelay(350);
}
