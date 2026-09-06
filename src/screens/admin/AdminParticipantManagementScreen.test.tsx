import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupStatus,
} from "@/features/group/types/group.types";
import AdminParticipantManagementScreen from "./AdminParticipantManagementScreen";

const {
  pushMock,
  replaceMock,
  useAdminGroupQueryMock,
  useAdminParticipantListQueryMock,
  useMyGroupProfileQueryMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useAdminParticipantListQueryMock: vi.fn(),
  useMyGroupProfileQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6" }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/participant/hooks/useAdminParticipantListQuery", () => ({
  useAdminParticipantListQuery: useAdminParticipantListQueryMock,
}));

vi.mock("@/features/profile/hooks/useMyGroupProfileQuery", () => ({
  useMyGroupProfileQuery: useMyGroupProfileQueryMock,
}));

function createGroup(status: GroupStatus): GroupDetail {
  return {
    groupId: 6,
    groupName: "MixMate",
    description: null,
    status,
    inviteCode: "ABC123",
    createdAt: "2026-09-01T00:00:00.000Z",
    memberCount: 1,
    myRole: "HOST",
    myParticipantId: 1,
  };
}

describe("AdminParticipantManagementScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminParticipantListQueryMock.mockReturnValue({
      data: {
        groupName: "MixMate",
        participants: [],
      },
    });
    useMyGroupProfileQueryMock.mockReturnValue({ data: null });
  });

  it.each(["RECRUITING", "FIRST_ROUND", "VOTING", "SECOND_ROUND"] as const)(
    "%s 상태의 참가자 목록에서는 통계/조편성 탭과 조편성 버튼을 숨긴다",
    (status) => {
      useAdminGroupQueryMock.mockReturnValue({ data: createGroup(status) });

      render(<AdminParticipantManagementScreen />);

      expect(
        screen.queryByRole("button", { name: "통계" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "조 편성" }),
      ).not.toBeInTheDocument();
    },
  );

  it.each(["BEFORE_FIRST_ROUND", "BEFORE_SECOND_ROUND"] as const)(
    "%s 조편성 준비 상태에서는 기존 관리자 탭과 조편성 버튼을 보여준다",
    (status) => {
      useAdminGroupQueryMock.mockReturnValue({
        data: createGroup(status),
      });

      render(<AdminParticipantManagementScreen />);

      expect(screen.getByRole("button", { name: "통계" })).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: "조 편성" })).toHaveLength(
        2,
      );
    },
  );
});
