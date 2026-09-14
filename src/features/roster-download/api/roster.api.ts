import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { apiFetch } from "@/shared/api/apiFetch";
import type { GroupRoster } from "../types/roster.types";

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? "명단 정보를 불러오지 못했습니다.";
  } catch {
    return "명단 정보를 불러오지 못했습니다.";
  }
}

export async function getGroupRoster(
  groupId: string,
  signal?: AbortSignal,
): Promise<GroupRoster> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/roster`,
    {
      headers: { Accept: "application/json" },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as GroupRoster;
}

