import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import GroupExtraInfoScreen from "./GroupExtraInfoScreen";
import * as groupApi from "@/features/group/api/group.api";

const mockBack = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();

let mockSearchParams = new Map<string, string>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
  }),
}));

describe("GroupExtraInfoScreen - Closed Notice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new Map<string, string>([["inviteCode", "JOIN123"]]);
  });

  const defaultProps = {
    groupId: "25",
    initialData: {
      name: "홍길동",
      department: "컴퓨터공학과",
      grade: "2학년" as const,
      gender: "남" as const,
      isNew: "기존" as const,
      rolePosition: "일반" as const,
      mbti: "ENTP",
    },
  };

  it("프로필 제출 시 409 마감 에러 발생 시 '모집이 마감되었습니다' 모달이 표시되고 확인 클릭 시 /home으로 이동한다", async () => {
    vi.spyOn(groupApi, "joinGroupWithProfileApi").mockRejectedValue(
      new groupApi.GroupApiError(
        "이미 마감되었거나 시작된 모임입니다.",
        409,
        "RECRUITMENT_CLOSED",
      ),
    );

    render(<GroupExtraInfoScreen {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "저장하기" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("모집이 마감되었습니다")).toBeInTheDocument();
      expect(
        screen.getByText("참가자 모집이 완료되어 그룹에 참여할 수 없습니다."),
      ).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole("button", { name: "확인" });
    fireEvent.click(confirmBtn);

    expect(mockReplace).toHaveBeenCalledWith("/home");
  });

  it("프로필 제출 시 일반 에러 발생 시 기존처럼 '저장 실패' 모달이 표시된다", async () => {
    vi.spyOn(groupApi, "joinGroupWithProfileApi").mockRejectedValue(
      new Error("네트워크 연결이 원활하지 않습니다."),
    );

    render(<GroupExtraInfoScreen {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "저장하기" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("저장 실패")).toBeInTheDocument();
      expect(
        screen.getByText("네트워크 연결이 원활하지 않습니다."),
      ).toBeInTheDocument();
    });
  });

  it("화면 진입(마운트) 시 이미 마감된 그룹이면 저장하기를 누르기 전에 즉시 마감 모달이 뜨고 확인 시 /home으로 이동한다", async () => {
    vi.spyOn(groupApi, "verifyInviteCodeApi").mockRejectedValue(
      new groupApi.GroupApiError(
        "모집이 마감된 모임입니다.",
        409,
        "RECRUITMENT_CLOSED",
      ),
    );

    render(<GroupExtraInfoScreen {...defaultProps} />);

    // 버튼 클릭 없이도 마운트 직후 바로 모달이 떠야 함
    await waitFor(() => {
      expect(screen.getByText("모집이 마감되었습니다")).toBeInTheDocument();
      expect(
        screen.getByText("참가자 모집이 완료되어 그룹에 참여할 수 없습니다."),
      ).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole("button", { name: "확인" });
    fireEvent.click(confirmBtn);

    expect(mockReplace).toHaveBeenCalledWith("/home");
  });
});
