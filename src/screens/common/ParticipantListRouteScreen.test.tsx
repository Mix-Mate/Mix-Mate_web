import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupStatus,
} from "@/features/group/types/group.types";
import ParticipantListRouteScreen from "./ParticipantListRouteScreen";

const { useAdminGroupQueryMock, searchParamsGetMock } = vi.hoisted(() => ({
  useAdminGroupQueryMock: vi.fn(),
  searchParamsGetMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6" }),
  useSearchParams: () => ({ get: searchParamsGetMock }),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/screens/admin/AdminParticipantManagementScreen", () => ({
  default: () => <div data-testid="admin-participant-management" />,
}));

vi.mock("./ParticipantListScreen", () => ({
  default: () => <div data-testid="participant-list-screen" />,
}));

function createGroup(status: GroupStatus): GroupDetail {
  return {
    groupId: 6,
    groupName: "MixMate",
    description: null,
    status,
    inviteCode: "ABC123",
    createdAt: "2026-09-01T00:00:00.000Z",
    memberCount: 8,
    myRole: "HOST",
    myParticipantId: 1,
  };
}

describe("ParticipantListRouteScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGetMock.mockReturnValue(null);
  });

  it.each(["RECRUITING", "BEFORE_FIRST_ROUND", "BEFORE_SECOND_ROUND"] as const)(
    "%s 상태의 관리자는 참가자 관리 화면으로 진입한다",
    (status) => {
      useAdminGroupQueryMock.mockReturnValue({ data: createGroup(status) });

      render(<ParticipantListRouteScreen />);

      expect(
        screen.getByTestId("admin-participant-management"),
      ).toBeInTheDocument();
    },
  );

  it.each(["FIRST_ROUND", "VOTING", "VOTE_CLOSED", "SECOND_ROUND"] as const)(
    "%s 상태의 관리자는 조별 보기가 가능한 참가자 목록으로 진입한다",
    (status) => {
      useAdminGroupQueryMock.mockReturnValue({ data: createGroup(status) });

      render(<ParticipantListRouteScreen />);

      expect(screen.getByTestId("participant-list-screen")).toBeInTheDocument();
    },
  );

  it("결과 목록 모드는 상태와 관계없이 참가자 목록 화면으로 진입한다", () => {
    searchParamsGetMock.mockImplementation((key: string) =>
      key === "list" ? "mvp" : null,
    );
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("BEFORE_FIRST_ROUND"),
    });

    render(<ParticipantListRouteScreen />);

    expect(screen.getByTestId("participant-list-screen")).toBeInTheDocument();
  });
});
