import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupStatus,
} from "@/features/group/types/group.types";
import type { MyGroupProfile } from "@/features/profile/types/profile.types";
import ParticipantProfileScreen from "./ParticipantProfileScreen";

const {
  pushMock,
  backMock,
  searchParamsGetMock,
  useAdminGroupQueryMock,
  useAdminParticipantListQueryMock,
  useBlockParticipantMutationMock,
  useMyGroupProfileQueryMock,
  useParticipantListQueryMock,
  useParticipantProfileQueryMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  backMock: vi.fn(),
  searchParamsGetMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useAdminParticipantListQueryMock: vi.fn(),
  useBlockParticipantMutationMock: vi.fn(),
  useMyGroupProfileQueryMock: vi.fn(),
  useParticipantListQueryMock: vi.fn(),
  useParticipantProfileQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
    replace: vi.fn(),
  }),
  useSearchParams: () => ({ get: searchParamsGetMock, toString: () => "" }),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/blacklist/hooks/useBlockParticipantMutation", () => ({
  useBlockParticipantMutation: useBlockParticipantMutationMock,
}));

vi.mock("@/features/participant/hooks/useAdminParticipantListQuery", () => ({
  useAdminParticipantListQuery: useAdminParticipantListQueryMock,
}));

vi.mock("@/features/participant/hooks/useParticipantListQuery", () => ({
  useParticipantListQuery: useParticipantListQueryMock,
}));

vi.mock("@/features/participant/hooks/useParticipantProfileQuery", () => ({
  useParticipantProfileQuery: useParticipantProfileQueryMock,
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
    memberCount: 3,
    myRole: "HOST",
    myParticipantId: 1,
  };
}

const myProfile: MyGroupProfile = {
  id: "1",
  displayName: "백승빈",
  position: "STAFF",
  major: "컴퓨터공학과",
  isNew: true,
  grade: "THIRD",
  gender: "MALE",
  mbti: "ISFP",
  age: 24,
  instaId: "mixmate",
  bio: "안녕하세요",
  visibility: "PUBLIC",
};

describe("ParticipantProfileScreen profile edit action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGetMock.mockReturnValue(null);
    useAdminGroupQueryMock.mockReturnValue({ data: createGroup("RECRUITING") });
    useBlockParticipantMutationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    useAdminParticipantListQueryMock.mockReturnValue({
      data: { groupName: "MixMate", participants: [] },
    });
    useParticipantListQueryMock.mockReturnValue({
      data: { participants: [], teams: [] },
    });
    useParticipantProfileQueryMock.mockReturnValue({
      data: null,
      isError: false,
    });
    useMyGroupProfileQueryMock.mockReturnValue({
      data: myProfile,
      isError: false,
    });
  });

  it("관리자는 모집중인 본인 참가자 프로필에서 수정 버튼을 사용할 수 있다", () => {
    render(<ParticipantProfileScreen groupId="6" participantId="1" />);

    fireEvent.click(screen.getByRole("button", { name: "프로필 수정" }));

    expect(pushMock).toHaveBeenCalledWith("/groups/6/profile/edit");
  });

  it.each([
    "BEFORE_FIRST_ROUND",
    "FIRST_ROUND",
    "BEFORE_SECOND_ROUND",
  ] as const)(
    "%s 상태에서는 본인 프로필이어도 수정 버튼을 보여주지 않는다",
    (status) => {
      useAdminGroupQueryMock.mockReturnValue({ data: createGroup(status) });

      render(<ParticipantProfileScreen groupId="6" participantId="1" />);

      expect(
        screen.queryByRole("button", { name: "프로필 수정" }),
      ).not.toBeInTheDocument();
    },
  );

  it("모집중이어도 다른 참가자 프로필에는 수정 버튼을 보여주지 않는다", () => {
    useParticipantProfileQueryMock.mockReturnValue({
      data: {
        id: "2",
        name: "다른 참가자",
        department: "소프트웨어학과",
        visibility: "public",
        role: "general",
        gender: "female",
        grade: "2학년",
        mbti: "ENFP",
        isNew: false,
      },
      isError: false,
    });

    render(<ParticipantProfileScreen groupId="6" participantId="2" />);

    expect(
      screen.queryByRole("button", { name: "프로필 수정" }),
    ).not.toBeInTheDocument();
  });
});
