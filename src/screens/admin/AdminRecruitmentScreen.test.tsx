import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import { HOST_RECRUITMENT_ONBOARDING_STORAGE_KEY } from "@/features/onboarding/model/host-recruitment-onboarding-storage";
import AdminRecruitmentScreen from "./AdminRecruitmentScreen";

const {
  refetchMock,
  pushMock,
  replaceMock,
  closeRecruitingMock,
  useAdminGroupQueryMock,
  useCloseRecruitingMutationMock,
  useParticipantListQueryMock,
  participantRefetchMock,
  clipboardWriteTextMock,
  useGroupInvitationQueryMock,
  useReissueGroupInvitationMutationMock,
  reissueInvitationMock,
} = vi.hoisted(() => ({
  refetchMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  closeRecruitingMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useCloseRecruitingMutationMock: vi.fn(),
  useParticipantListQueryMock: vi.fn(),
  participantRefetchMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
  useGroupInvitationQueryMock: vi.fn(),
  useReissueGroupInvitationMutationMock: vi.fn(),
  reissueInvitationMock: vi.fn(),
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

vi.mock("@/features/group/hooks/useCloseRecruitingMutation", () => ({
  useCloseRecruitingMutation: useCloseRecruitingMutationMock,
}));

vi.mock("@/features/group/hooks/useGroupInvitationQuery", () => ({
  useGroupInvitationQuery: useGroupInvitationQueryMock,
}));

vi.mock("@/features/group/hooks/useReissueGroupInvitationMutation", () => ({
  useReissueGroupInvitationMutation: useReissueGroupInvitationMutationMock,
}));

vi.mock("@/features/participant/hooks/useParticipantListQuery", () => ({
  useParticipantListQuery: useParticipantListQueryMock,
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
    vi.useFakeTimers();
    vi.clearAllMocks();
    // 온보딩을 이미 확인한 상태를 기본값으로 두고, 온보딩 자체는 아래에서 따로 검증한다.
    window.localStorage.setItem(
      HOST_RECRUITMENT_ONBOARDING_STORAGE_KEY,
      "true",
    );
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: clipboardWriteTextMock },
    });
    useAdminGroupQueryMock.mockReturnValue({
      data: group,
      refetch: refetchMock,
    });
    useCloseRecruitingMutationMock.mockReturnValue({
      mutate: closeRecruitingMock,
      isPending: false,
      error: null,
    });
    useGroupInvitationQueryMock.mockReturnValue({
      data: {
        inviteCode: "ABC123",
        expiresAt: "2026-09-22T00:00:00.000Z",
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    useReissueGroupInvitationMutationMock.mockReturnValue({
      mutate: reissueInvitationMock,
      isPending: false,
      error: null,
    });
    useParticipantListQueryMock.mockReturnValue({
      data: { participants: [], teams: [] },
      isLoading: false,
      isError: false,
      refetch: participantRefetchMock,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.localStorage.clear();
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

  it("최근 참여자 목록에는 호스트 본인이 나오지 않는다", () => {
    useParticipantListQueryMock.mockReturnValue({
      data: {
        participants: [
          {
            id: "1",
            name: "호스트",
            department: "소프트웨어학과",
            visibility: "public",
            role: "staff",
            gender: "male",
          },
          {
            id: "2",
            name: "참가자A",
            department: "경영학과",
            visibility: "public",
            role: "general",
            gender: "female",
          },
        ],
        teams: [],
      },
      isLoading: false,
      isError: false,
      refetch: participantRefetchMock,
    });

    render(<AdminRecruitmentScreen />);

    expect(screen.queryByText("호스트")).not.toBeInTheDocument();
    expect(screen.getByText("참가자A")).toBeInTheDocument();
  });

  it("헤더 편집 버튼 대신 그룹 코드 카드의 수정 행으로 진입한다", () => {
    render(<AdminRecruitmentScreen />);

    expect(
      screen.queryByRole("button", { name: "그룹 정보 편집" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "그룹 정보 수정" }));

    expect(pushMock).toHaveBeenCalledExactlyOnceWith("/groups/7/edit");
  });

  it("참여 코드로 만든 초대 링크와 계산된 남은 시간을 표시한다", async () => {
    render(<AdminRecruitmentScreen />);

    expect(screen.getByText("참여 코드")).toBeInTheDocument();
    expect(screen.getByText("MixMate.invite")).toBeInTheDocument();
    expect(screen.getByText("0일 1시간 0분").parentElement).toHaveTextContent(
      "참여코드/초대링크 만료까지 0일 1시간 0분",
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "초대 링크 복사" }));
    });

    expect(clipboardWriteTextMock).toHaveBeenCalledExactlyOnceWith(
      "http://localhost:3000/groups/join?inviteCode=ABC123",
    );
  });

  it("재발급 버튼을 누르면 7일 정책이 반영된 확인 모달을 보여준다", () => {
    render(<AdminRecruitmentScreen />);

    fireEvent.click(screen.getByRole("button", { name: "재발급" }));

    const dialog = screen.getByRole("dialog", {
      name: /참여 코드와 초대 링크를\s*새로 발급할까요/,
    });
    expect(dialog).toHaveTextContent(
      "기존 참여 코드와 초대 링크는즉시 사용할 수 없게 됩니다.새 참여 코드는 7일간 유효해요.",
    );

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("재발급 확인 시 API 응답의 새 참여 코드로 화면을 갱신한다", async () => {
    reissueInvitationMock.mockResolvedValue({
      inviteCode: "NEW789",
      expiresAt: "2026-09-23T00:00:00.000Z",
    });
    render(<AdminRecruitmentScreen />);

    fireEvent.click(screen.getByRole("button", { name: "재발급" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "재발급하기" }));
    });

    expect(reissueInvitationMock).toHaveBeenCalledExactlyOnceWith("7");
    expect(screen.getByText("NEW789")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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

  it("최신 그룹 상태가 먼저 갱신돼도 3초까지 전환 화면을 유지한다", async () => {
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

    const { rerender } = render(<AdminRecruitmentScreen />);

    fireEvent.click(screen.getByRole("button", { name: "모집 마감하기" }));
    fireEvent.click(screen.getByRole("button", { name: "모집 마감 확인" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByTestId("recruitment-transition")).toHaveAttribute(
      "data-phase",
      "preparing",
    );
    expect(screen.getByRole("status")).toHaveTextContent("그룹 홈 준비 중");
    expect(screen.queryByText(group.groupName)).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();

    await act(async () => {
      resolveRefetch?.(closedGroup);
    });
    useAdminGroupQueryMock.mockReturnValue({
      data: closedGroup,
      refetch: refetchMock,
    });
    rerender(<AdminRecruitmentScreen />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999);
    });
    expect(screen.getByTestId("recruitment-transition")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(replaceMock).toHaveBeenCalledExactlyOnceWith(
      "/groups/7/preparation",
    );
  });

  it.each([
    { closeMs: 0, refreshMs: 0, displayMs: 3000 },
    { closeMs: 500, refreshMs: 500, displayMs: 3000 },
    { closeMs: 1000, refreshMs: 2000, displayMs: 3000 },
    { closeMs: 4000, refreshMs: 1000, displayMs: 5000 },
    { closeMs: 500, refreshMs: 4500, displayMs: 5000 },
  ])(
    "마감 $closeMs ms + 조회 $refreshMs ms이면 총 $displayMs ms 후 이동한다",
    async ({ closeMs, refreshMs, displayMs }) => {
      useAdminGroupQueryMock.mockReturnValue({
        data: { ...group, memberCount: 4 },
        refetch: refetchMock,
      });
      closeRecruitingMock.mockImplementation(() =>
        closeMs === 0
          ? Promise.resolve(true)
          : new Promise((resolve) => setTimeout(() => resolve(true), closeMs)),
      );
      const closedGroup = { ...group, status: "BEFORE_FIRST_ROUND" };
      refetchMock.mockImplementation(() =>
        refreshMs === 0
          ? Promise.resolve(closedGroup)
          : new Promise((resolve) =>
              setTimeout(() => resolve(closedGroup), refreshMs),
            ),
      );

      render(<AdminRecruitmentScreen />);
      fireEvent.click(screen.getByRole("button", { name: "모집 마감하기" }));
      fireEvent.click(screen.getByRole("button", { name: "모집 마감 확인" }));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2999);
      });
      expect(screen.getByTestId("recruitment-transition")).toBeInTheDocument();
      expect(replaceMock).not.toHaveBeenCalled();

      if (displayMs > 3000) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(displayMs - 3000);
        });
        expect(
          screen.getByTestId("recruitment-transition"),
        ).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(replaceMock).toHaveBeenCalledExactlyOnceWith(
        "/groups/7/preparation",
      );
      expect(refetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it("3초 대기 중 화면을 떠나면 타이머와 예약된 이동을 취소한다", async () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: { ...group, memberCount: 4 },
      refetch: refetchMock,
    });
    closeRecruitingMock.mockResolvedValue(true);
    refetchMock.mockResolvedValue({ ...group, status: "BEFORE_FIRST_ROUND" });

    const { unmount } = render(<AdminRecruitmentScreen />);
    fireEvent.click(screen.getByRole("button", { name: "모집 마감하기" }));
    fireEvent.click(screen.getByRole("button", { name: "모집 마감 확인" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    unmount();
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(replaceMock).not.toHaveBeenCalled();
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

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(
      screen.queryByTestId("recruitment-transition"),
    ).not.toBeInTheDocument();
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

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(
      screen.queryByTestId("recruitment-transition"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "모집 마감하기" }),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  describe("HOST 온보딩", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    const onboarding = () => screen.getByTestId("spotlight-onboarding");

    it("HOST가 처음 진입하면 첫 단계부터 온보딩을 보여준다", () => {
      render(<AdminRecruitmentScreen />);

      expect(onboarding()).toBeInTheDocument();
      expect(screen.getByText("1 / 7")).toBeInTheDocument();
      expect(
        screen.getByRole("dialog", { name: "모임의 진행 상태를 확인해요" }),
      ).toHaveTextContent("현재 모임이 어느 단계인지 한눈에 확인할 수 있어요.");
    });

    it("참가자에게는 온보딩을 노출하지 않는다", () => {
      useAdminGroupQueryMock.mockReturnValue({
        data: { ...group, myRole: "PARTICIPANT" as const },
        refetch: refetchMock,
      });

      render(<AdminRecruitmentScreen />);

      expect(
        screen.queryByTestId("spotlight-onboarding"),
      ).not.toBeInTheDocument();
    });

    it("화면을 눌러도 단계만 넘어가고 기존 버튼 동작은 실행되지 않는다", () => {
      render(<AdminRecruitmentScreen />);

      fireEvent.click(onboarding());

      expect(screen.getByText("2 / 7")).toBeInTheDocument();
      expect(
        screen.getByRole("dialog", {
          name: "참가자를 초대해요",
        }),
      ).toHaveTextContent(
        "그룹 코드를 복사해 공유하면 참가자가 모임에 참여할 수 있어요.",
      );

      fireEvent.click(screen.getByRole("button", { name: "다음" }));

      expect(screen.getByText("3 / 7")).toBeInTheDocument();
      expect(
        screen.getByRole("dialog", {
          name: "초대 링크로 바로 참여해요",
        }),
      ).toHaveTextContent(
        "참가자는 초대 링크만 열면 코드를 입력하지 않고 바로 모임 참여를 시작할 수 있어요.",
      );

      fireEvent.click(screen.getByRole("button", { name: "다음" }));

      expect(screen.getByText("4 / 7")).toBeInTheDocument();
      expect(
        screen.getByRole("dialog", {
          name: "필요하면 초대를 다시 발급해요",
        }),
      ).toHaveTextContent(
        "참여 코드나 링크가 외부에 공유됐거나 유효기간이 지났다면 새 초대를 발급해 다시 공유할 수 있어요.",
      );
      expect(pushMock).not.toHaveBeenCalled();
    });

    it("마지막 단계에서 시작하기를 누르면 온보딩이 끝나고 다시 열리지 않는다", () => {
      const { unmount } = render(<AdminRecruitmentScreen />);

      for (const stepLabel of [
        "1 / 7",
        "2 / 7",
        "3 / 7",
        "4 / 7",
        "5 / 7",
        "6 / 7",
      ]) {
        expect(screen.getByText(stepLabel)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "다음" }));
      }

      expect(screen.getByText("7 / 7")).toBeInTheDocument();
      expect(
        screen.getByRole("dialog", { name: "모두 모였다면 모집을 마감해요" }),
      ).toHaveTextContent(
        "HOST는 이후 2차 참여 투표에서 불참을 선택하더라도 모임 진행과 관리 기능을 계속 사용할 수 있어요.",
      );

      fireEvent.click(screen.getByRole("button", { name: "시작하기" }));
      expect(
        screen.queryByTestId("spotlight-onboarding"),
      ).not.toBeInTheDocument();

      unmount();
      render(<AdminRecruitmentScreen />);
      expect(
        screen.queryByTestId("spotlight-onboarding"),
      ).not.toBeInTheDocument();
    });

    it("건너뛰기도 완료와 동일하게 확인한 상태로 저장한다", () => {
      const { unmount } = render(<AdminRecruitmentScreen />);

      fireEvent.click(screen.getByRole("button", { name: "건너뛰기" }));
      expect(
        screen.queryByTestId("spotlight-onboarding"),
      ).not.toBeInTheDocument();
      expect(
        window.localStorage.getItem(HOST_RECRUITMENT_ONBOARDING_STORAGE_KEY),
      ).toBe("true");

      unmount();
      render(<AdminRecruitmentScreen />);
      expect(
        screen.queryByTestId("spotlight-onboarding"),
      ).not.toBeInTheDocument();
    });
  });
});
