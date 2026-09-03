import { StrictMode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyTeamQuery } from "./useMyTeamQuery";

const { getMyTeamMock } = vi.hoisted(() => ({
  getMyTeamMock: vi.fn(),
}));

vi.mock("../api/team.api", () => ({
  getMyTeam: getMyTeamMock,
}));

const myTeamResponse = {
  round: "FIRST_ROUND" as const,
  team: {
    teamNumber: 1,
    members: [],
  },
};

describe("useMyTeamQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyTeamMock.mockResolvedValue(myTeamResponse);
  });

  it("개발 모드의 Strict Mode에서도 my-team API를 한 번만 요청한다", async () => {
    const { result } = renderHook(() => useMyTeamQuery("6", "FIRST_ROUND"), {
      wrapper: StrictMode,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(myTeamResponse.team);
    });
    expect(getMyTeamMock).toHaveBeenCalledOnce();
  });

  it("화면에서 사라지면 진행 중인 요청을 취소한다", async () => {
    let requestSignal: AbortSignal | undefined;
    getMyTeamMock.mockImplementation(
      (_groupId: string, _round: string, signal?: AbortSignal) => {
        requestSignal = signal;
        return new Promise(() => undefined);
      },
    );

    const { unmount } = renderHook(() => useMyTeamQuery("6", "FIRST_ROUND"));

    await waitFor(() => {
      expect(getMyTeamMock).toHaveBeenCalledOnce();
    });
    unmount();

    await waitFor(() => {
      expect(requestSignal?.aborted).toBe(true);
    });
  });
});
