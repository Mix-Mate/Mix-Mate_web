import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupJoinScreen from "./GroupJoinScreen";
import {
  GroupApiError,
  verifyInviteCodeApi,
} from "@/features/group/api/group.api";

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

vi.mock("@/features/group/api/group.api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/group/api/group.api")>();
  return {
    ...actual,
    verifyInviteCodeApi: vi.fn(),
  };
});

describe("GroupJoinScreen 초대 코드 검증 및 마감 그룹 차단 플로우", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const enterCode = (codeStr: string) => {
    const inputs = screen.getAllByRole("textbox");
    codeStr.split("").forEach((char, index) => {
      fireEvent.change(inputs[index], { target: { value: char } });
    });
  };

  it("409 Conflict (INVALID_GROUP_STATUS) 발생 시 2단계로 이동하지 않고 '참가자 모집이 마감된 그룹입니다.' 에러를 표시한다", async () => {
    vi.mocked(verifyInviteCodeApi).mockRejectedValueOnce(
      new GroupApiError(
        "참가자 모집이 마감된 그룹입니다.",
        409,
        "INVALID_GROUP_STATUS",
      ),
    );

    render(<GroupJoinScreen />);

    enterCode("ABC123");

    const submitBtn = screen.getByRole("button", { name: "입장하기" });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("참가자 모집이 마감된 그룹입니다."),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input.className).toMatch(/otpInputError/);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("404 Not Found (INVALID_INVITE_CODE) 발생 시 2단계로 이동하지 않고 '유효하지 않은 초대코드입니다.' 에러를 표시한다", async () => {
    vi.mocked(verifyInviteCodeApi).mockRejectedValueOnce(
      new GroupApiError(
        "유효하지 않은 초대코드입니다.",
        404,
        "INVALID_INVITE_CODE",
      ),
    );

    render(<GroupJoinScreen />);

    enterCode("WRONG1");
    fireEvent.click(screen.getByRole("button", { name: "입장하기" }));

    await waitFor(() => {
      expect(
        screen.getByText("유효하지 않은 초대코드입니다."),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input.className).toMatch(/otpInputError/);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("200 OK 성공 시 2단계(추가 정보 입력) 화면으로 전환한다", async () => {
    vi.mocked(verifyInviteCodeApi).mockResolvedValueOnce({
      groupId: 99,
      groupName: "환상의 모임",
      status: "RECRUITING",
    });

    render(<GroupJoinScreen />);

    enterCode("PASS99");
    fireEvent.click(screen.getByRole("button", { name: "입장하기" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/groups/99/extra"),
      );
    });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("inviteCode=PASS99"),
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining(
        "groupName=%ED%99%98%EC%83%81%EC%9D%98+%EB%AA%A8%EC%9E%84",
      ),
    );
    expect(
      screen.queryByText("참가자 모집이 마감된 그룹입니다."),
    ).not.toBeInTheDocument();
  });

  it("200 OK 응답이지만 status가 RECRUITMENT_CLOSED인 경우 2단계로 이동하지 않고 마감 헬퍼 에러를 표시한다", async () => {
    vi.mocked(verifyInviteCodeApi).mockResolvedValueOnce({
      groupId: 99,
      groupName: "마감된 모임",
      status: "RECRUITMENT_CLOSED",
    });

    render(<GroupJoinScreen />);

    enterCode("CLSD99");
    fireEvent.click(screen.getByRole("button", { name: "입장하기" }));

    await waitFor(() => {
      expect(
        screen.getByText("참가자 모집이 마감된 그룹입니다."),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("에러 표시 후 사용자가 새 문자를 입력하면 에러 상태가 초기화된다", async () => {
    vi.mocked(verifyInviteCodeApi).mockRejectedValueOnce(
      new GroupApiError(
        "참가자 모집이 마감된 그룹입니다.",
        409,
        "INVALID_GROUP_STATUS",
      ),
    );

    render(<GroupJoinScreen />);

    enterCode("ABC123");
    fireEvent.click(screen.getByRole("button", { name: "입장하기" }));

    await waitFor(() => {
      expect(
        screen.getByText("참가자 모집이 마감된 그룹입니다."),
      ).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Z" } });

    expect(
      screen.queryByText("참가자 모집이 마감된 그룹입니다."),
    ).not.toBeInTheDocument();
    expect(inputs[0].className).not.toMatch(/otpInputError/);
  });

  it("일반 403/FORBIDDEN은 차단 모달과 차단 저장을 만들지 않는다", async () => {
    vi.mocked(verifyInviteCodeApi).mockRejectedValueOnce(
      new GroupApiError("접근 권한이 없습니다.", 403, "FORBIDDEN"),
    );

    render(<GroupJoinScreen />);

    enterCode("DENY99");
    fireEvent.click(screen.getByRole("button", { name: "입장하기" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "접근 권한이 없습니다.",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem("mixmate_blocked_groups")).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("명시적인 BLOCKED 응답은 차단 모달을 표시한다", async () => {
    vi.mocked(verifyInviteCodeApi).mockRejectedValueOnce(
      new GroupApiError(
        "해당 그룹에서 차단되어 참여할 수 없습니다.",
        403,
        "BLOCKED",
      ),
    );

    render(<GroupJoinScreen />);

    enterCode("BLCK99");
    fireEvent.click(screen.getByRole("button", { name: "입장하기" }));

    await waitFor(() => {
      expect(
        screen.getByText("해당 그룹에서 차단되어 참여할 수 없습니다."),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("400 Bad Request 발생 시 2단계로 이동하지 않고 에러 메시지를 표시한다", async () => {
    vi.mocked(verifyInviteCodeApi).mockRejectedValueOnce(
      new GroupApiError("참여코드를 입력해 주세요.", 400),
    );

    render(<GroupJoinScreen />);

    enterCode("BAD123");
    fireEvent.click(screen.getByRole("button", { name: "입장하기" }));

    await waitFor(() => {
      expect(screen.getByText("참여코드를 입력해 주세요.")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
