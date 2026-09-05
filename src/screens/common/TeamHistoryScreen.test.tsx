import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TeamHistoryScreen from "./TeamHistoryScreen";

const { pushMock, useAdminGroupQueryMock, usePreviousTeamQueryMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    useAdminGroupQueryMock: vi.fn(),
    usePreviousTeamQueryMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "7" }),
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/history/hooks/usePreviousTeamQuery", () => ({
  usePreviousTeamQuery: usePreviousTeamQueryMock,
}));

const mockTeam = {
  teamNumber: 2,
  members: [
    {
      participantId: 11,
      displayName: "공개참가자",
      major: "컴퓨터공학과",
      gender: "MALE" as const,
      visibility: "PUBLIC" as const,
      fixed: false,
    },
    {
      participantId: 12,
      displayName: "비공개참가자",
      major: "소프트웨어학과",
      gender: "FEMALE" as const,
      visibility: "PRIVATE" as const,
      fixed: false,
    },
  ],
};

describe("TeamHistoryScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminGroupQueryMock.mockReturnValue({
      data: { myRole: "PARTICIPANT" },
    });
    usePreviousTeamQueryMock.mockReturnValue({
      data: mockTeam,
      isLoading: false,
      error: null,
    });
  });

  it("일반 사용자가 이전조 기록의 비공개 프로필을 누르면 안내 모달을 보여준다", () => {
    render(<TeamHistoryScreen />);

    fireEvent.click(
      screen.getByRole("button", { name: "비공개참가자 프로필 확인" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "비공개 프로필입니다",
    });

    expect(dialog).toBeInTheDocument();
    expect(screen.getAllByText("소프트웨어학과")).toHaveLength(2);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("일반 사용자가 이전조 기록의 공개 프로필을 누르면 상세 화면으로 이동한다", () => {
    render(<TeamHistoryScreen />);

    fireEvent.click(
      screen.getByRole("button", { name: "공개참가자 프로필 확인" }),
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/groups/7/participants/11?from=%2Fgroups%2F7%2Fhistory",
    );
  });

  it("일반 사용자가 이전조 기록에서 본인의 비공개 프로필을 누르면 내 프로필 화면으로 이동한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: { myRole: "PARTICIPANT", myParticipantId: 12 },
    });

    render(<TeamHistoryScreen />);

    fireEvent.click(
      screen.getByRole("button", { name: "비공개참가자 프로필 확인" }),
    );

    expect(pushMock).toHaveBeenCalledWith("/groups/7/profile");
    expect(
      screen.queryByRole("dialog", { name: "비공개 프로필입니다" }),
    ).not.toBeInTheDocument();
  });
});
