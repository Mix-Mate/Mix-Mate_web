import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import GroupEditScreen from "./GroupEditScreen";

const {
  backMock,
  replaceMock,
  refetchMock,
  updateGroupMock,
  deleteGroupMock,
  useAdminGroupQueryMock,
  useUpdateGroupMutationMock,
  useDeleteGroupMutationMock,
} = vi.hoisted(() => ({
  backMock: vi.fn(),
  replaceMock: vi.fn(),
  refetchMock: vi.fn(),
  updateGroupMock: vi.fn(),
  deleteGroupMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useUpdateGroupMutationMock: vi.fn(),
  useDeleteGroupMutationMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "7" }),
  useRouter: () => ({
    back: backMock,
    replace: replaceMock,
  }),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/group/hooks/useUpdateGroupMutation", () => ({
  useUpdateGroupMutation: useUpdateGroupMutationMock,
}));

vi.mock("@/features/group/hooks/useDeleteGroupMutation", () => ({
  useDeleteGroupMutation: useDeleteGroupMutationMock,
}));

const group: GroupDetail = {
  groupId: 7,
  groupName: "테스트 모임",
  description: "테스트 설명입니다.",
  status: "RECRUITING",
  inviteCode: "ABC123",
  createdAt: "2026-09-02T00:00:00.000Z",
  memberCount: 3,
  myRole: "HOST",
  myParticipantId: 1,
};

describe("GroupEditScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    useAdminGroupQueryMock.mockReturnValue({
      data: group,
      refetch: refetchMock,
    });
    useUpdateGroupMutationMock.mockReturnValue({
      mutate: updateGroupMock,
      isPending: false,
      error: null,
      fieldErrors: {},
    });
    useDeleteGroupMutationMock.mockReturnValue({
      mutate: deleteGroupMock,
      isPending: false,
      error: null,
    });
  });

  it("조회된 그룹명과 설명을 폼 초기값으로 표시한다", () => {
    render(<GroupEditScreen />);

    expect(screen.getByLabelText(/그룹명/)).toHaveValue("테스트 모임");
    expect(screen.getByLabelText(/설명 \(선택\)/)).toHaveValue(
      "테스트 설명입니다.",
    );
    expect(screen.getByLabelText(/설명 \(선택\)/)).toHaveAttribute(
      "placeholder",
      "그룹에 대한 설명을 입력해주세요.",
    );
  });

  it("기존 validation schema로 잘못된 그룹명 문자를 검증한다", async () => {
    render(<GroupEditScreen />);

    const nameInput = screen.getByLabelText(/그룹명/);
    fireEvent.change(nameInput, { target: { value: "모임🔥" } });
    fireEvent.blur(nameInput);

    expect(
      await screen.findByText(
        "그룹 이름에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
      ),
    ).toBeInTheDocument();
  });

  it("변경사항 저장 시 기존 수정 mutation과 refetch를 호출한 뒤 이전 화면으로 돌아간다", async () => {
    updateGroupMock.mockResolvedValue(true);
    refetchMock.mockResolvedValue({
      ...group,
      groupName: "수정된 모임",
      description: "수정된 설명",
    });
    render(<GroupEditScreen />);

    fireEvent.change(screen.getByLabelText(/그룹명/), {
      target: { value: "수정된 모임" },
    });
    fireEvent.change(screen.getByLabelText(/설명 \(선택\)/), {
      target: { value: "수정된 설명" },
    });
    fireEvent.click(screen.getByRole("button", { name: "변경사항 저장" }));

    await waitFor(() => {
      expect(updateGroupMock).toHaveBeenCalledWith("7", {
        groupName: "수정된 모임",
        description: "수정된 설명",
      });
    });
    expect(refetchMock).toHaveBeenCalledOnce();
    expect(window.sessionStorage.getItem("adminToast")).toBe(
      "그룹 정보가 수정되었습니다.",
    );
    expect(backMock).toHaveBeenCalledOnce();
  });

  it("헤더 뒤로가기는 브라우저 history를 그대로 사용한다", () => {
    render(<GroupEditScreen />);

    fireEvent.click(screen.getByRole("button", { name: "이전 화면으로 이동" }));

    expect(backMock).toHaveBeenCalledOnce();
  });

  it("삭제 row에서 기존 확인 dialog와 삭제 mutation을 실행하고 홈으로 이동한다", async () => {
    deleteGroupMock.mockResolvedValue(true);
    render(<GroupEditScreen />);

    fireEvent.click(screen.getByRole("button", { name: "그룹 삭제하기" }));
    expect(
      screen.getByRole("alertdialog", { name: "그룹을 삭제할까요?" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "삭제하기" }));

    await waitFor(() => {
      expect(deleteGroupMock).toHaveBeenCalledExactlyOnceWith("7");
    });
    expect(replaceMock).toHaveBeenCalledExactlyOnceWith("/home");
  });
});
