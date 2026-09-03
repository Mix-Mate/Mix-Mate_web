import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import AdminRecruitmentScreen from "./AdminRecruitmentScreen";

const {
  refetchMock,
  replaceMock,
  closeRecruitingMock,
  useAdminGroupQueryMock,
  useCloseRecruitingMutationMock,
  useDeleteGroupMutationMock,
  useUpdateGroupMutationMock,
} = vi.hoisted(() => ({
  refetchMock: vi.fn(),
  replaceMock: vi.fn(),
  closeRecruitingMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useCloseRecruitingMutationMock: vi.fn(),
  useDeleteGroupMutationMock: vi.fn(),
  useUpdateGroupMutationMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "7" }),
  useRouter: () => ({
    push: vi.fn(),
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/group/hooks/useCloseRecruitingMutation", () => ({
  useCloseRecruitingMutation: useCloseRecruitingMutationMock,
}));

vi.mock("@/features/group/hooks/useDeleteGroupMutation", () => ({
  useDeleteGroupMutation: useDeleteGroupMutationMock,
}));

vi.mock("@/features/group/hooks/useUpdateGroupMutation", () => ({
  useUpdateGroupMutation: useUpdateGroupMutationMock,
}));

vi.mock("@/features/group/hooks/useInviteCodeRemainingTime", () => ({
  useInviteCodeRemainingTime: () => ({
    days: 0,
    hours: 1,
    minutes: 0,
    seconds: 0,
    remainingMs: 3_600_000,
  }),
}));

vi.mock("@/shared/hooks/useToast", () => ({
  default: () => ({ message: null, showToast: vi.fn() }),
}));

vi.mock("@/modals/admin/CloseRecruitmentDialog", () => ({
  default: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? (
      <button type="button" onClick={onConfirm}>
        모집 마감 확인
      </button>
    ) : null,
}));

vi.mock("@/modals/admin/DeleteGroupDialog", () => ({
  default: () => null,
}));

vi.mock("@/modals/admin/EditGroupDialog", () => ({
  default: () => null,
}));

const group: GroupDetail = {
  groupId: 7,
  groupName: "테스트 모임",
  description: null,
  status: "RECRUITING",
  inviteCode: "ABC123",
  createdAt: "2026-09-02T00:00:00.000Z",
  memberCount: 3,
  myRole: "HOST",
  myParticipantId: 1,
};

describe("AdminRecruitmentScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminGroupQueryMock.mockReturnValue({
      data: group,
      refetch: refetchMock,
    });
    useCloseRecruitingMutationMock.mockReturnValue({
      mutate: closeRecruitingMock,
      isPending: false,
      error: null,
    });
    useDeleteGroupMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    useUpdateGroupMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
  });

  it("모집 안내에 최소 참가 인원을 강조해서 보여준다", () => {
    render(<AdminRecruitmentScreen />);

    const minimumParticipantText = screen.getByText("4명");

    expect(minimumParticipantText.parentElement).toHaveTextContent(
      "참가자가 4명 이상 모이면 1차 술자리를 시작할 수 있어요.",
    );
    expect(minimumParticipantText.tagName).toBe("STRONG");
    expect(minimumParticipantText.parentElement?.className).toContain(
      "minimumParticipantText",
    );
  });

  it("모집 중인 그룹 홈에서 메인 홈으로 나가기 전에 확인 팝업을 보여준다", () => {
    render(<AdminRecruitmentScreen />);

    fireEvent.click(screen.getByRole("button", { name: "이전 화면으로 이동" }));
    expect(
      screen.getByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "이전 화면으로 이동" }));
    fireEvent.click(screen.getByRole("button", { name: "나가기" }));
    expect(replaceMock).toHaveBeenCalledExactlyOnceWith("/home");
  });

  it("모집 인원이 4명 미만이면 모집 마감 버튼을 비활성화한다", () => {
    render(<AdminRecruitmentScreen />);

    expect(
      screen.getByRole("button", { name: "모집 마감하기" }),
    ).toBeDisabled();
  });

  it("모집 인원이 4명이면 모집 마감 버튼을 활성화한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: { ...group, memberCount: 4 },
      refetch: refetchMock,
    });

    render(<AdminRecruitmentScreen />);

    expect(screen.getByRole("button", { name: "모집 마감하기" })).toBeEnabled();
  });

  it("모집 마감을 확인하면 그룹 홈 전환 화면을 보여준다", async () => {
    let resolveRefetch: ((value: GroupDetail) => void) | undefined;
    const refetchPromise = new Promise<GroupDetail>((resolve) => {
      resolveRefetch = resolve;
    });
    const closedGroup = {
      ...group,
      memberCount: 4,
      status: "BEFORE_FIRST_ROUND" as const,
    };

    useAdminGroupQueryMock.mockReturnValue({
      data: { ...group, memberCount: 4 },
      refetch: refetchMock,
    });
    closeRecruitingMock.mockResolvedValue(true);
    refetchMock.mockReturnValue(refetchPromise);

    render(<AdminRecruitmentScreen />);

    fireEvent.click(screen.getByRole("button", { name: "모집 마감하기" }));
    fireEvent.click(screen.getByRole("button", { name: "모집 마감 확인" }));

    expect(
      await screen.findByTestId("recruitment-transition"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("recruitment-transition")).toHaveAttribute(
        "data-phase",
        "preparing",
      ),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "그룹 홈을 준비하고 있어요",
    );
    expect(replaceMock).not.toHaveBeenCalled();

    resolveRefetch?.(closedGroup);
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledExactlyOnceWith(
        "/groups/7/admin/preparation",
      ),
    );
  });

  it("모집 마감에 실패하면 전환 화면을 닫고 확인 화면으로 돌아온다", async () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: { ...group, memberCount: 4 },
      refetch: refetchMock,
    });
    closeRecruitingMock.mockResolvedValue(false);

    render(<AdminRecruitmentScreen />);

    fireEvent.click(screen.getByRole("button", { name: "모집 마감하기" }));
    fireEvent.click(screen.getByRole("button", { name: "모집 마감 확인" }));

    await waitFor(() =>
      expect(
        screen.queryByTestId("recruitment-transition"),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "모집 마감 확인" }),
    ).toBeInTheDocument();
    expect(refetchMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("최신 그룹 정보 조회에 실패해도 전환 화면에 갇히지 않는다", async () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: { ...group, memberCount: 4 },
      refetch: refetchMock,
    });
    closeRecruitingMock.mockResolvedValue(true);
    refetchMock.mockResolvedValue(null);

    render(<AdminRecruitmentScreen />);

    fireEvent.click(screen.getByRole("button", { name: "모집 마감하기" }));
    fireEvent.click(screen.getByRole("button", { name: "모집 마감 확인" }));

    await waitFor(() =>
      expect(
        screen.queryByTestId("recruitment-transition"),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "모집 마감하기" }),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
