import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import type { RosterResponse } from "../types/roster.types";

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getRoster(
  groupId: string,
  signal?: AbortSignal,
): Promise<RosterResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/roster`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "명단을 불러오지 못했습니다."),
    );
  }

  return (await response.json()) as RosterResponse;
}
