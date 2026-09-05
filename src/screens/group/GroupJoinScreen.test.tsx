import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import GroupJoinScreen from "./GroupJoinScreen";
import * as groupApi from "@/features/group/api/group.api";

const mockBack = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe("GroupJoinScreen - Closed and Started Notice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const enterCode = (code: string) => {
    const inputs = screen.getAllByRole("textbox");
    code.split("").forEach((char, i) => {
      fireEvent.change(inputs[i], { target: { value: char } });
    });
  };

  it("409 에러 및 마감 문구 반환 시 '모집이 마감된 모임입니다' 모달이 표시된다", async () => {
    vi.spyOn(groupApi, "verifyInviteCodeApi").mockRejectedValue(
      new groupApi.GroupApiError(
        "모집이 마감된 모임입니다.",
        409,
        "RECRUITMENT_CLOSED",
      ),
    );

    render(<GroupJoinScreen />);
    enterCode("JOIN99");

    const submitButton = screen.getByRole("button", { name: "입장하기" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("모집이 마감된 모임입니다")).toBeInTheDocument();
      expect(
        screen.getByText("모집이 완료되었거나 이미 시작되어 참여할 수 없습니다."),
      ).toBeInTheDocument();
    });

    // 다시 입력하기 클릭 시 인풋 리셋 확인
    const retryBtn = screen.getByRole("button", { name: "다시 입력하기" });
    fireEvent.click(retryBtn);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs.forEach((input) => {
      expect(input.value).toBe("");
    });
  });

  it("409 에러 및 정원 초과(GROUP_FULL) 반환 시 '모집이 마감된 모임입니다' 모달이 표시된다", async () => {
    vi.spyOn(groupApi, "verifyInviteCodeApi").mockRejectedValue(
      new groupApi.GroupApiError(
        "정원이 초과되었습니다.",
        409,
        "GROUP_FULL",
      ),
    );

    render(<GroupJoinScreen />);
    enterCode("FULL12");

    const submitButton = screen.getByRole("button", { name: "입장하기" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("모집이 마감된 모임입니다")).toBeInTheDocument();
      expect(
        screen.getByText("모집이 완료되었거나 이미 시작되어 참여할 수 없습니다."),
      ).toBeInTheDocument();
    });
  });

  it("409 ALREADY_STARTED 또는 시작 문구 반환 시 '이미 시작된 그룹입니다' 모달이 표시된다", async () => {
    vi.spyOn(groupApi, "verifyInviteCodeApi").mockRejectedValue(
      new groupApi.GroupApiError(
        "이미 모임이 시작되었습니다.",
        409,
        "ALREADY_STARTED",
      ),
    );

    render(<GroupJoinScreen />);
    enterCode("STRT12");

    const submitButton = screen.getByRole("button", { name: "입장하기" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("이미 시작된 그룹입니다")).toBeInTheDocument();
      expect(
        screen.getByText("모집이 완료되었거나 이미 시작되어 참여할 수 없습니다."),
      ).toBeInTheDocument();
    });
  });

  it("200 OK 응답이라도 status가 BEFORE_FIRST_ROUND(마감)이면 추가 정보 화면으로 넘어가지 않고 마감 모달이 표시된다", async () => {
    vi.spyOn(groupApi, "verifyInviteCodeApi").mockResolvedValue({
      groupId: 55,
      groupName: "마감된 모임",
      status: "BEFORE_FIRST_ROUND",
    });

    render(<GroupJoinScreen />);
    enterCode("CLSD55");

    const submitButton = screen.getByRole("button", { name: "입장하기" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("모집이 마감된 모임입니다")).toBeInTheDocument();
      expect(
        screen.getByText("모집이 완료되었거나 이미 시작되어 참여할 수 없습니다."),
      ).toBeInTheDocument();
    });

    // router.push로 추가 정보 화면(/groups/55/extra)으로 이동하지 않았는지 검증
    expect(mockPush).not.toHaveBeenCalled();
  });
});
