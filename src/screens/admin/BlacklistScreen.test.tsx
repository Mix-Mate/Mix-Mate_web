import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlacklistScreen from "./BlacklistScreen";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useGroupBlacklistQuery } from "@/features/blacklist/hooks/useGroupBlacklistQuery";
import { useUnblockParticipantMutation } from "@/features/blacklist/hooks/useUnblockParticipantMutation";

const mockBack = vi.fn();
const mockReplace = vi.fn();
const mockRefetch = vi.fn();
const mockUnblock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
  useParams: () => ({ groupId: "17" }),
}));
vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: vi.fn(),
}));
vi.mock("@/features/blacklist/hooks/useGroupBlacklistQuery", () => ({
  useGroupBlacklistQuery: vi.fn(),
}));
vi.mock("@/features/blacklist/hooks/useUnblockParticipantMutation", () => ({
  useUnblockParticipantMutation: vi.fn(),
}));

const blockedParticipant = {
  id: "101",
  userId: 101,
  name: "홍길동",
  displayName: "홍길동",
  email: "gildong@example.com",
  reason: "지속적인 비매너 행위",
  blockedAt: "2026-08-30T00:00:00.000Z",
  bannedAt: "2026-08-30T00:00:00.000Z",
};

describe("BlacklistScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAdminGroupQuery).mockReturnValue({
      data: {
        groupId: 17,
        groupName: "테스트 모임",
        status: "RECRUITING",
        myRole: "HOST",
        myParticipantId: 1,
      },
    } as ReturnType<typeof useAdminGroupQuery>);
    vi.mocked(useGroupBlacklistQuery).mockReturnValue({
      data: {
        groupName: "테스트 모임",
        participants: [blockedParticipant],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    vi.mocked(useUnblockParticipantMutation).mockReturnValue({
      mutate: mockUnblock.mockResolvedValue({ ok: true }),
      isPending: false,
    });
  });

  it("참가자의 관리자 전용 화면 접근을 차단한다", () => {
    vi.mocked(useAdminGroupQuery).mockReturnValue({
      data: {
        groupId: 17,
        groupName: "테스트 모임",
        status: "RECRUITING",
        myRole: "PARTICIPANT",
        myParticipantId: 2,
      },
    } as ReturnType<typeof useAdminGroupQuery>);

    render(<BlacklistScreen />);

    expect(screen.getByText("접근 권한이 없습니다")).toBeInTheDocument();
  });

  it("관리자가 이름과 사유로 차단 목록을 검색할 수 있다", () => {
    render(<BlacklistScreen />);

    fireEvent.change(
      screen.getByPlaceholderText("이름, 소속, 차단 사유 검색"),
      { target: { value: "없는 사용자" } },
    );

    expect(screen.getByText("차단된 사용자가 없습니다")).toBeInTheDocument();
  });

  it("선택한 사용자의 차단을 해제하고 목록을 다시 조회한다", async () => {
    render(<BlacklistScreen />);

    fireEvent.click(screen.getByText("홍길동"));
    fireEvent.click(screen.getByRole("button", { name: "그룹 차단 해제" }));
    fireEvent.click(screen.getByRole("button", { name: "해제하기" }));

    await waitFor(() => {
      expect(mockUnblock).toHaveBeenCalledWith("17", 101);
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
