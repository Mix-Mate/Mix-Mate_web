import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail, GroupStatus } from "@/features/group/types/group.types";
import ProgressScreen from "./ProgressScreen";

const {
  finishFirstRoundMock,
  finishGroupMock,
  refetchMock,
  replaceMock,
  useAdminGroupQueryMock,
} = vi.hoisted(() => ({
  finishFirstRoundMock: vi.fn(),
  finishGroupMock: vi.fn(),
  refetchMock: vi.fn(),
  replaceMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6" }),
  useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/group/hooks/useFinishFirstRoundMutation", () => ({
  useFinishFirstRoundMutation: () => ({
    mutate: finishFirstRoundMock,
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/features/group/hooks/useFinishGroupMutation", () => ({
  useFinishGroupMutation: () => ({
    mutate: finishGroupMock,
    isPending: false,
    error: null,
  }),
}));

function createGroup(status: GroupStatus): GroupDetail {
  return {
    groupId: 6,
    groupName: "API 그룹",
    description: null,
    status,
    inviteCode: "ABC123",
    createdAt: "2026-08-27T00:00:00.000Z",
    memberCount: 8,
    myRole: "HOST",
    myParticipantId: 3,
  };
}

async function confirmFirstRoundEnd() {
  fireEvent.click(
    screen.getByRole("button", { name: "1차 술자리 종료하기" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "종료하기" }));
}

describe("ProgressScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    finishFirstRoundMock.mockResolvedValue(true);
    finishGroupMock.mockResolvedValue(true);
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("FIRST_ROUND"),
      refetch: refetchMock,
    });
  });

  it("1차 종료 후 VOTING 상태를 재확인하고 투표 화면으로 이동한다", async () => {
    refetchMock.mockResolvedValue(createGroup("VOTING"));
    render(<ProgressScreen />);

    await confirmFirstRoundEnd();

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalledOnce();
      expect(replaceMock).toHaveBeenCalledWith("/groups/6/votes/mvp");
    });
    expect(finishFirstRoundMock.mock.invocationCallOrder[0]).toBeLessThan(
      refetchMock.mock.invocationCallOrder[0],
    );
    expect(refetchMock.mock.invocationCallOrder[0]).toBeLessThan(
      replaceMock.mock.invocationCallOrder[0],
    );
  });

  it("재조회한 상태가 VOTING이 아니면 이동하지 않고 오류를 표시한다", async () => {
    refetchMock.mockResolvedValue(createGroup("FIRST_ROUND"));
    render(<ProgressScreen />);

    await confirmFirstRoundEnd();

    expect(
      await screen.findByRole("alert", {
        name: "",
      }),
    ).toHaveTextContent("투표 시작 상태를 확인하지 못했습니다.");
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
