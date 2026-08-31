import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupStatus,
} from "@/features/group/types/group.types";
import MvpVoteScreen from "./MvpVoteScreen";
import AttendanceVoteScreen from "./AttendanceVoteScreen";

const { query, router, submit } = vi.hoisted(() => ({
  query: { data: null as GroupDetail | null },
  router: { replace: vi.fn(), push: vi.fn(), back: vi.fn() },
  submit: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "7" }),
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams("role=admin"),
}));
vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: () => query,
}));
vi.mock("@/features/vote/hooks/useVoteStatusQuery", () => ({
  useVoteStatusQuery: () => ({
    data: { participants: [{ participantId: 1, choice: null }] },
    isComplete: false,
  }),
}));
vi.mock("@/features/vote/hooks/useMvpVote", () => ({
  useMvpVote: () => ({
    context: {
      status: "OPEN",
      candidates: [
        {
          participantId: 2,
          name: "후보",
          department: "컴공",
          gender: "female",
          profileVisibility: "PUBLIC",
        },
      ],
      selectedParticipantId: null,
      hasSubmitted: false,
    },
    isLoading: false,
    isSubmitting: false,
    error: null,
    submit,
  }),
}));
vi.mock("@/features/vote/hooks/useAttendanceVote", () => ({
  useAttendanceVote: () => ({
    context: { status: "OPEN", selectedChoice: null, hasSubmitted: false },
    isLoading: false,
    isSubmitting: false,
    error: null,
    submit,
  }),
}));

describe.each([
  {
    name: "MVP",
    Page: MvpVoteScreen,
    input: "2",
    button: "다음 - 2차 참여 여부 투표 →",
  },
  {
    name: "Attendance",
    Page: AttendanceVoteScreen,
    input: "PARTICIPATE",
    button: "투표 완료하기",
  },
])("$name 접근 상태 검증", ({ Page, input, button }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.data = {
      groupId: 7,
      groupName: "투표",
      description: null,
      status: "VOTING",
      inviteCode: "ABC",
      createdAt: "2026-08-31",
      memberCount: 4,
      myRole: "HOST",
      myParticipantId: 1,
    };
  });

  it.each(["HOST", "PARTICIPANT"] as const)(
    "%s가 아직 투표 전인 URL에 진입하면 실제 역할의 홈으로 돌려보낸다",
    (myRole) => {
      query.data = { ...query.data!, status: "FIRST_ROUND", myRole };
      render(<Page />);
      expect(router.replace).toHaveBeenCalledExactlyOnceWith(
        myRole === "HOST" ? "/groups/7/admin" : "/groups/7",
      );
      expect(screen.getByRole("button", { name: button })).toBeDisabled();
      expect(submit).not.toHaveBeenCalled();
    },
  );

  it.each([
    "VOTE_CLOSED",
    "BEFORE_SECOND_ROUND",
    "SECOND_ROUND",
    "FINISHED",
  ] satisfies GroupStatus[])(
    "%s 상태로 옛 투표 URL에 재진입하면 제출을 차단하고 결과로 이동한다",
    (status) => {
      query.data = { ...query.data!, status };
      render(<Page />);
      expect(router.replace).toHaveBeenCalledExactlyOnceWith(
        "/groups/7/votes/result",
      );
      expect(screen.getByRole("button", { name: button })).toBeDisabled();
    },
  );

  it("제출 중 SSE로 투표가 종료되면 늦은 제출 응답보다 최신 상태에 따른 이동을 유지한다", async () => {
    let resolve!: (value: { success: boolean }) => void;
    submit.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { rerender } = render(<Page />);
    fireEvent.click(screen.getByDisplayValue(input));
    fireEvent.click(screen.getByRole("button", { name: button }));
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
    query.data = { ...query.data!, status: "VOTE_CLOSED" };
    rerender(<Page />);
    await act(async () => resolve({ success: true }));
    expect(router.replace).toHaveBeenCalledExactlyOnceWith(
      "/groups/7/votes/result",
    );
  });
});
