import { fetchEventSource } from "@microsoft/fetch-event-source";
import { z } from "zod";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { getAccessToken } from "@/shared/api/authToken";
import { GROUP_STATUSES, type GroupStatusEvent } from "../types/group.types";

const statusEventSchema = z.object({
  groupId: z.number().int().positive(),
  status: z.enum(GROUP_STATUSES),
});

const errorMessages: Record<number, string> = {
  401: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  403: "이 그룹에 참여하고 있지 않습니다.",
  404: "존재하지 않는 그룹입니다.",
};

export class GroupStatusStreamError extends Error {
  constructor(public readonly status: number) {
    super(
      errorMessages[status] ?? "그룹 상태 실시간 연결을 시작하지 못했습니다.",
    );
    this.name = "GroupStatusStreamError";
  }
}

export interface GroupStatusStreamOptions {
  onStatus: (event: GroupStatusEvent) => void;
  onError: (error: GroupStatusStreamError) => void;
}

export function subscribeGroupStatus(
  groupId: string,
  { onStatus, onError }: GroupStatusStreamOptions,
): () => void {
  const controller = new AbortController();
  let retryAttempt = 0;

  void fetchEventSource(
    `${API_BASE_URL}/api/v1/groups/${groupId}/status/stream`,
    {
      signal: controller.signal,
      headers: { accept: "text/event-stream" },
      credentials: "include",
      cache: "no-store",
      // 그룹 화면에 있는 동안 유지한다. 탭 표시 변경으로 중복 재연결하지 않는다.
      openWhenHidden: true,
      fetch: (input, init) => {
        // 30분 종료나 네트워크 오류로 재연결할 때도 최신 토큰을 사용한다.
        const token = getAccessToken();
        if (!token) throw new GroupStatusStreamError(401);

        const headers = new Headers(init?.headers);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
      async onopen(response) {
        if (!response.ok) {
          if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 408 &&
            response.status !== 429
          ) {
            throw new GroupStatusStreamError(response.status);
          }
          throw new Error("그룹 상태 연결을 다시 시도합니다.");
        }

        if (
          response.status !== 200 ||
          !response.headers.get("content-type")?.startsWith("text/event-stream")
        ) {
          throw new GroupStatusStreamError(response.status);
        }
      },
      onmessage(message) {
        // 이 라이브러리의 onmessage는 이름 있는 이벤트도 받는다. :ping은 무시한다.
        if (controller.signal.aborted || message.event !== "status") return;

        let payload: unknown;
        try {
          payload = JSON.parse(message.data);
        } catch {
          return;
        }
        const result = statusEventSchema.safeParse(payload);
        if (!result.success || result.data.groupId !== Number(groupId)) return;

        retryAttempt = 0;
        onStatus(result.data);
      },
      onclose() {
        // 서버의 30분 정상 종료도 재연결해야 최초 snapshot으로 따라잡을 수 있다.
        throw new Error("그룹 상태 스트림이 종료되었습니다.");
      },
      onerror(error: unknown) {
        if (error instanceof GroupStatusStreamError) throw error;

        const delay = Math.min(1_000 * 2 ** retryAttempt, 30_000);
        retryAttempt = Math.min(retryAttempt + 1, 5);
        return Math.min(delay * (1 + Math.random() * 0.2), 30_000);
      },
    },
  ).catch((error: unknown) => {
    if (!controller.signal.aborted) {
      onError(
        error instanceof GroupStatusStreamError
          ? error
          : new GroupStatusStreamError(0),
      );
    }
  });

  return () => controller.abort();
}
