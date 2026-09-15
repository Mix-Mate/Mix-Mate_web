import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GroupApiError, verifyInviteCodeApi } from "@/features/group/api/group.api";
import GroupJoinScreen from "./GroupJoinScreen";

const router = {
  back: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/features/group/api/group.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/group/api/group.api")>()),
  verifyInviteCodeApi: vi.fn(),
}));

function submitInviteCode(code = "ABC123") {
  Array.from(code).forEach((character, index) => {
    fireEvent.change(
      screen.getByRole("textbox", {
        name: `참여코드 ${index + 1}번째 자리`,
      }),
      { target: { value: character } },
    );
  });
  fireEvent.click(screen.getByRole("button", { name: "입장하기" }));
}

describe("GroupJoinScreen 차단 오류 분기", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("일반 403/FORBIDDEN은 차단 모달과 차단 저장을 만들지 않는다", async () => {
    vi.mocked(verifyInviteCodeApi).mockRejectedValue(
      new GroupApiError("접근 권한이 없습니다.", 403, "FORBIDDEN"),
    );

    render(<GroupJoinScreen />);
    submitInviteCode();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "접근 권한이 없습니다.",
    );
    expect(
      screen.queryByRole("dialog", { name: "그룹 참여가 제한되었습니다" }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem("mixmate_blocked_groups")).toBeNull();
  });

  it("명시적인 차단 코드일 때만 차단 모달을 보여준다", async () => {
    vi.mocked(verifyInviteCodeApi).mockRejectedValue(
      new GroupApiError(
        "해당 그룹 관리자에 의해 참여가 차단된 사용자입니다.",
        403,
        "USER_BLOCKED",
      ),
    );

    render(<GroupJoinScreen />);
    submitInviteCode();

    expect(
      await screen.findByRole("dialog", {
        name: "그룹 참여가 제한되었습니다",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "홈으로 이동" })).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("검증 성공 시 기존 추가 정보 입력 경로로 이동한다", async () => {
    vi.mocked(verifyInviteCodeApi).mockResolvedValue({
      groupId: 17,
      groupName: "정상 그룹",
      status: "RECRUITING",
    });

    render(<GroupJoinScreen />);
    submitInviteCode();

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(
        "/groups/17/extra?from=join&inviteCode=ABC123&groupName=%EC%A0%95%EC%83%81+%EA%B7%B8%EB%A3%B9",
      );
    });
  });
});
