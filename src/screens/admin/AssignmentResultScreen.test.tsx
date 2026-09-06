import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AssignmentTeam } from "@/features/assignment/types/assignment.types";
import type { GroupDetail } from "@/features/group/types/group.types";
import AssignmentResultScreen from "./AssignmentResultScreen";

const {
  clearAssignmentResultDraftMock,
  confirmAssignmentMock,
  getAssignmentResultDraftMock,
  pushMock,
  refetchGroupMock,
  replaceMock,
  useAdminGroupQueryMock,
  useConfirmAssignmentMutationMock,
  useCreateAssignmentMutationMock,
} = vi.hoisted(() => ({
  clearAssignmentResultDraftMock: vi.fn(),
  confirmAssignmentMock: vi.fn(),
  getAssignmentResultDraftMock: vi.fn(),
  pushMock: vi.fn(),
  refetchGroupMock: vi.fn(),
  replaceMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useConfirmAssignmentMutationMock: vi.fn(),
  useCreateAssignmentMutationMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "7" }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/assignment/hooks/useConfirmAssignmentMutation", () => ({
  useConfirmAssignmentMutation: useConfirmAssignmentMutationMock,
}));

vi.mock("@/features/assignment/hooks/useCreateAssignmentMutation", () => ({
  useCreateAssignmentMutation: useCreateAssignmentMutationMock,
}));

vi.mock("@/features/assignment/model/assignmentDraft.store", () => ({
  clearAssignmentResultDraft: clearAssignmentResultDraftMock,
  getAssignmentResultDraft: getAssignmentResultDraftMock,
  getAssignmentSetupDraft: vi.fn(),
  saveAssignmentResultDraft: vi.fn(),
}));

const group: GroupDetail = {
  groupId: 7,
  groupName: "테스트 모임",
  description: null,
  status: "BEFORE_FIRST_ROUND",
  inviteCode: "ABC123",
  createdAt: "2026-09-06T00:00:00.000Z",
  memberCount: 4,
  myRole: "HOST",
  myParticipantId: 1,
};

const teams: AssignmentTeam[] = [
  {
    teamNumber: 1,
    members: [
      {
        participantId: 1,
        displayName: "김믹스",
        major: "컴퓨터공학과",
        gender: "MALE",
        visibility: "PUBLIC",
        fixed: false,
      },
    ],
  },
];

describe("AssignmentResultScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAssignmentResultDraftMock.mockReturnValue(teams);
    refetchGroupMock.mockResolvedValue(group);
    useAdminGroupQueryMock.mockReturnValue({
      data: group,
      refetch: refetchGroupMock,
    });
    useCreateAssignmentMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    useConfirmAssignmentMutationMock.mockReturnValue({
      mutate: confirmAssignmentMock,
      isPending: false,
      error: null,
    });
  });

  it("확정 CTA를 누르면 API 호출 없이 최종 확인 모달을 표시한다", () => {
    render(<AssignmentResultScreen />);

    fireEvent.click(screen.getByRole("button", { name: "조 편성 확정하기" }));

    expect(
      screen.getByRole("dialog", { name: "조 편성을 확정하시겠어요?" }),
    ).toHaveTextContent(
      "조 편성을 확정하면 현재 결과로 모임이 진행되며, 이후에는 이전 단계로 돌아갈 수 없습니다.",
    );
    expect(confirmAssignmentMock).not.toHaveBeenCalled();
  });

  it("취소하면 모달만 닫고 결과 화면과 데이터를 그대로 유지한다", () => {
    render(<AssignmentResultScreen />);

    fireEvent.click(screen.getByRole("button", { name: "조 편성 확정하기" }));
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("assignment-result-screen")).toBeInTheDocument();
    expect(screen.getByText("김믹스")).toBeInTheDocument();
    expect(confirmAssignmentMock).not.toHaveBeenCalled();
    expect(clearAssignmentResultDraftMock).not.toHaveBeenCalled();
    expect(refetchGroupMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("모달에서 확정해야 기존 확정 후처리와 화면 이동을 실행한다", async () => {
    confirmAssignmentMock.mockResolvedValue(true);
    render(<AssignmentResultScreen />);

    fireEvent.click(screen.getByRole("button", { name: "조 편성 확정하기" }));
    fireEvent.click(screen.getByRole("button", { name: "확정하기" }));

    await waitFor(() => {
      expect(confirmAssignmentMock).toHaveBeenCalledExactlyOnceWith("7", 1);
      expect(clearAssignmentResultDraftMock).toHaveBeenCalledExactlyOnceWith(
        "7",
        1,
      );
      expect(refetchGroupMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledExactlyOnceWith("/groups/7");
    });
  });

  it("확정 버튼을 빠르게 연속 클릭해도 API를 한 번만 호출한다", async () => {
    let resolveConfirmation: ((confirmed: boolean) => void) | undefined;
    confirmAssignmentMock.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveConfirmation = resolve;
      }),
    );
    render(<AssignmentResultScreen />);

    fireEvent.click(screen.getByRole("button", { name: "조 편성 확정하기" }));
    const confirmButton = screen.getByRole("button", { name: "확정하기" });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    expect(confirmAssignmentMock).toHaveBeenCalledTimes(1);

    resolveConfirmation?.(false);
    await waitFor(() => {
      expect(clearAssignmentResultDraftMock).not.toHaveBeenCalled();
    });
  });

  it("확정 요청 중에는 모달의 취소와 확정 버튼을 비활성화한다", () => {
    const { rerender } = render(<AssignmentResultScreen />);
    fireEvent.click(screen.getByRole("button", { name: "조 편성 확정하기" }));

    useConfirmAssignmentMutationMock.mockReturnValue({
      mutate: confirmAssignmentMock,
      isPending: true,
      error: null,
    });
    rerender(<AssignmentResultScreen />);

    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "확정 중..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "확정 중..." })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("확정 API 이후 상태 갱신과 이동이 끝날 때까지 전체 확정 흐름을 잠근다", async () => {
    let resolveRefetch: ((group: GroupDetail) => void) | undefined;
    confirmAssignmentMock.mockResolvedValue(true);
    refetchGroupMock.mockReturnValue(
      new Promise<GroupDetail>((resolve) => {
        resolveRefetch = resolve;
      }),
    );
    render(<AssignmentResultScreen />);

    fireEvent.click(screen.getByRole("button", { name: "조 편성 확정하기" }));
    fireEvent.click(screen.getByRole("button", { name: "확정하기" }));

    await waitFor(() => {
      expect(refetchGroupMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "확정 중..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "재셔플" })).toBeDisabled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.getByRole("dialog", { name: "조 편성을 확정하시겠어요?" }),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();

    await act(async () => {
      resolveRefetch?.(group);
    });

    expect(replaceMock).toHaveBeenCalledExactlyOnceWith("/groups/7");
  });
});
