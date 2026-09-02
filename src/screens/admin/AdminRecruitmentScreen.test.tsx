import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import AdminRecruitmentScreen from "./AdminRecruitmentScreen";

const {
  refetchMock,
  useAdminGroupQueryMock,
  useCloseRecruitingMutationMock,
  useDeleteGroupMutationMock,
  useUpdateGroupMutationMock,
} = vi.hoisted(() => ({
  refetchMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useCloseRecruitingMutationMock: vi.fn(),
  useDeleteGroupMutationMock: vi.fn(),
  useUpdateGroupMutationMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "7" }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
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
  default: () => null,
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
    useAdminGroupQueryMock.mockReturnValue({ data: group, refetch: refetchMock });
    useCloseRecruitingMutationMock.mockReturnValue({
      mutate: vi.fn(),
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

    expect(
      screen.getByRole("button", { name: "모집 마감하기" }),
    ).toBeEnabled();
  });
});
