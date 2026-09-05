import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupStatus,
} from "@/features/group/types/group.types";
import AssignmentSetupScreen from "./AssignmentSetupScreen";

const {
  backMock,
  createAssignmentMock,
  pushMock,
  replaceMock,
  useAdminGroupQueryMock,
  useParticipantCandidatesQueryMock,
  useVoteStatusQueryMock,
} = vi.hoisted(() => ({
  backMock: vi.fn(),
  createAssignmentMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useParticipantCandidatesQueryMock: vi.fn(),
  useVoteStatusQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6", round: "1" }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: backMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/assignment/hooks/useCreateAssignmentMutation", () => ({
  useCreateAssignmentMutation: () => ({
    mutate: createAssignmentMock,
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/features/assignment/hooks/useParticipantCandidatesQuery", () => ({
  useParticipantCandidatesQuery: useParticipantCandidatesQueryMock,
}));

vi.mock("@/features/vote/hooks/useVoteStatusQuery", () => ({
  useVoteStatusQuery: useVoteStatusQueryMock,
}));

function createGroup(status: GroupStatus = "RECRUITING"): GroupDetail {
  return {
    groupId: 6,
    groupName: "MixMate 모임",
    description: null,
    status,
    inviteCode: "ABC123",
    createdAt: "2026-08-27T00:00:00.000Z",
    memberCount: 8,
    myRole: "HOST",
    myParticipantId: 3,
  };
}

describe("AssignmentSetupScreen Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("RECRUITING"),
    });
    useParticipantCandidatesQueryMock.mockReturnValue({
      data: [
        { id: "1", name: "홍길동" },
        { id: "2", name: "김철수" },
        { id: "3", name: "이영희" },
        { id: "4", name: "박민수" },
      ],
      isLoading: false,
    });
    useVoteStatusQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it("뒤로가기 버튼 클릭 후 나가기를 확인해야 메인 홈으로 이동한다", () => {
    render(<AssignmentSetupScreen />);

    const backButton = screen.getByRole("button", {
      name: "이전 화면으로 이동",
    });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(
      screen.getByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "나가기" }));
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/home");
    expect(backMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("참가자 탭 클릭 시 참가자 관리 화면으로 이동한다", () => {
    render(<AssignmentSetupScreen />);

    const participantsTab = screen.getByRole("button", { name: "참가자" });
    fireEvent.click(participantsTab);

    expect(pushMock).toHaveBeenCalledWith("/groups/6/admin/participants");
  });
});
