import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import BlacklistScreen from "@/screens/admin/BlacklistScreen";
import BlockedUserProfileModal from "./components/BlockedUserProfileModal";
import ParticipantProfileScreen from "@/screens/common/ParticipantProfileScreen";
import HomeScreen from "@/screens/common/HomeScreen";
import GroupJoinScreen from "@/screens/group/GroupJoinScreen";
import GroupExtraInfoScreen from "@/screens/group/GroupExtraInfoScreen";
import AdminGroupQueryProvider from "@/features/group/components/AdminGroupQueryProvider";
import ParticipantPageHeader from "@/features/participant/components/ParticipantPageHeader";
import * as blacklistApi from "./api/blacklist.api";
import * as groupApi from "@/features/group/api/group.api";
import * as adminGroupQuery from "@/features/group/hooks/useAdminGroupQuery";
import * as adminParticipantQuery from "@/features/participant/hooks/useAdminParticipantListQuery";
import * as participantListQuery from "@/features/participant/hooks/useParticipantListQuery";
import * as participantProfileQuery from "@/features/participant/hooks/useParticipantProfileQuery";
import * as myGroupProfileQuery from "@/features/profile/hooks/useMyGroupProfileQuery";
import type { BlockedParticipant } from "./types/blacklist.types";
import type { AdminParticipantGroup, ParticipantProfile } from "@/features/participant/types/participant.types";

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new Map<string, string>([["role", "admin"]]);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
  }),
  useParams: () => ({ groupId: "17" }),
  usePathname: () => "/groups/17",
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
    has: (key: string) => mockSearchParams.has(key),
  }),
}));

const mockBlockedParticipants: BlockedParticipant[] = [
  {
    id: "101",
    userId: 101,
    name: "홍길동",
    displayName: "홍길동",
    department: "컴퓨터공학과",
    gender: "male",
    role: "general",
    visibility: "public",
    grade: "3학년",
    mbti: "ENFP",
    age: 23,
    instagramId: "gildong_hong",
    email: "gildong@example.com",
    reason: "지속적인 비매너 행위",
    blockedAt: "2026-08-30T00:00:00.000Z",
    bannedAt: "2026-08-30T00:00:00.000Z",
    isNew: false,
  },
];

const mockAdminGroup = {
  groupId: 17,
  groupName: "테스트 소모임",
  status: "RECRUITING",
  myRole: "HOST",
  myParticipantId: 1,
} as const;

const mockParticipantProfile: ParticipantProfile = {
  id: "202",
  name: "이순신",
  department: "경영학과",
  gender: "male",
  role: "general",
  visibility: "public",
  grade: "2학년",
  mbti: "ISTJ",
  age: 22,
  instagramId: "sunshin",
  bio: "안녕하세요",
  isNew: false,
};

const mockAdminParticipants: AdminParticipantGroup = {
  groupName: "테스트 소모임",
  participants: [mockParticipantProfile],
};

describe("Blacklist Feature & API Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    localStorage.setItem("accessToken", "mock-token");
  });

  describe("BlacklistScreen - Access Control & Viewing", () => {
    it("관리자가 아닐 경우(PARTICIPANT) 차단 목록 접근이 제한되고 권한 없음 화면이 표시된다", async () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: {
          ...mockAdminGroup,
          myRole: "PARTICIPANT",
        },
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      render(<BlacklistScreen />);

      await waitFor(() => {
        expect(screen.getByText("접근 권한이 없습니다")).toBeInTheDocument();
        expect(
          screen.getByText(/이 화면은 관리자 전용입니다/),
        ).toBeInTheDocument();
      });
    });

    it("관리자(HOST)인 경우 차단된 참가자 목록을 렌더링하고 검색 필터링이 정상 작동한다", async () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: mockAdminGroup,
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      vi.spyOn(blacklistApi, "getGroupBlacklist").mockResolvedValue({
        groupName: "테스트 소모임",
        participants: mockBlockedParticipants,
      });

      render(<BlacklistScreen />);

      await waitFor(() => {
        expect(screen.getByText("홍길동")).toBeInTheDocument();
        expect(screen.getByText("gildong@example.com")).toBeInTheDocument();
        expect(
          screen.getByText(/사유: 지속적인 비매너 행위/),
        ).toBeInTheDocument();
      });

      // 검색창 동작 테스트
      const searchInput = screen.getByPlaceholderText(
        "이름, 소속, 차단 사유 검색",
      );
      fireEvent.change(searchInput, { target: { value: "없는사람" } });

      await waitFor(() => {
        expect(
          screen.getByText("차단된 사용자가 없습니다"),
        ).toBeInTheDocument();
      });
    });

    it("차단 유저 클릭 시 상세 모달이 열리고 이메일 및 차단 사유가 표시되며 해제할 수 있다", async () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: mockAdminGroup,
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      vi.spyOn(blacklistApi, "getGroupBlacklist").mockResolvedValue({
        groupName: "테스트 소모임",
        participants: mockBlockedParticipants,
      });
      vi.spyOn(blacklistApi, "unblockParticipantApi").mockResolvedValue({
        ok: true,
        source: "api",
      });

      render(<BlacklistScreen />);

      await waitFor(() => {
        expect(screen.getByText("홍길동")).toBeInTheDocument();
      });

      // 유저 클릭 -> 상세 모달 오픈
      fireEvent.click(screen.getByText("홍길동"));

      await waitFor(() => {
        expect(
          screen.getAllByText("gildong@example.com").length,
        ).toBeGreaterThanOrEqual(1);
        expect(
          screen.getByText("지속적인 비매너 행위"),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "그룹 차단 해제" }),
        ).toBeInTheDocument();
      });

      // 해제 버튼 클릭 -> 확인 모달 오픈
      fireEvent.click(screen.getByRole("button", { name: "그룹 차단 해제" }));

      await waitFor(() => {
        expect(
          screen.getByText("그룹 차단을 해제하시겠습니까?"),
        ).toBeInTheDocument();
      });

      // 해제하기 클릭
      fireEvent.click(screen.getByRole("button", { name: "해제하기" }));

      await waitFor(() => {
        expect(blacklistApi.unblockParticipantApi).toHaveBeenCalledWith(
          "17",
          101,
        );
      });
    });
  });

  describe("ParticipantPageHeader - Menu Access Control", () => {
    it("관리자(HOST)에게는 햄버거 메뉴가 표시된다", async () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: mockAdminGroup,
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      render(
        <ParticipantPageHeader groupName="테스트 소모임" participantCount={5} />,
      );

      expect(screen.getByLabelText("관리자 메뉴 열기")).toBeInTheDocument();
    });

    it("일반 참가자(PARTICIPANT)에게는 햄버거 메뉴가 표시되지 않는다", async () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: {
          ...mockAdminGroup,
          myRole: "PARTICIPANT",
        },
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      render(
        <ParticipantPageHeader groupName="테스트 소모임" participantCount={5} />,
      );

      expect(
        screen.queryByLabelText("관리자 메뉴 열기"),
      ).not.toBeInTheDocument();
    });
  });

  describe("ParticipantProfileScreen - Block Action & Validation", () => {
    beforeEach(() => {
      mockSearchParams = new Map<string, string>([["role", "admin"]]);
      mockPush.mockClear();
      mockBack.mockClear();
      mockReplace.mockClear();
    });

    it("상세 프로필 조회가 성공하면 목록 fallback 요청을 시작하지 않는다", () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: mockAdminGroup,
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);
      const myProfileSpy = vi
        .spyOn(myGroupProfileQuery, "useMyGroupProfileQuery")
        .mockReturnValue({
          data: null,
          isLoading: false,
          isError: false,
        } as ReturnType<typeof myGroupProfileQuery.useMyGroupProfileQuery>);
      const profileDetailSpy = vi
        .spyOn(participantProfileQuery, "useParticipantProfileQuery")
        .mockReturnValue({
          data: mockParticipantProfile,
          isLoading: false,
          isError: false,
        } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);
      const adminFallbackSpy = vi
        .spyOn(adminParticipantQuery, "useAdminParticipantListQuery")
        .mockReturnValue({
          data: { groupName: "테스트 소모임", participants: [] },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);
      const participantFallbackSpy = vi
        .spyOn(participantListQuery, "useParticipantListQuery")
        .mockReturnValue({
          data: {
            participants: [],
            teams: [],
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof participantListQuery.useParticipantListQuery>);

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      expect(myProfileSpy).toHaveBeenCalledWith("17", { enabled: false });
      expect(profileDetailSpy).toHaveBeenCalledWith("17", "202", {
        detailRole: "admin",
        enabled: true,
      });
      expect(adminFallbackSpy).not.toHaveBeenCalled();
      expect(participantFallbackSpy).not.toHaveBeenCalled();
    });

    it("본인 프로필은 내 프로필 API만 조회한다", () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: { ...mockAdminGroup, myParticipantId: 202 },
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);
      const myProfileSpy = vi
        .spyOn(myGroupProfileQuery, "useMyGroupProfileQuery")
        .mockReturnValue({
          data: {
            id: "202",
            displayName: "이순신",
            position: "MEMBER",
            major: "경영학과",
            isNew: false,
            grade: "SECOND",
            gender: "MALE",
            mbti: "ISTJ",
            age: 22,
            instaId: "sunshin",
            bio: "안녕하세요",
            visibility: "PUBLIC",
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof myGroupProfileQuery.useMyGroupProfileQuery>);
      const profileDetailSpy = vi
        .spyOn(participantProfileQuery, "useParticipantProfileQuery")
        .mockReturnValue({
          data: null,
          isLoading: false,
          isError: false,
        } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);
      const adminFallbackSpy = vi
        .spyOn(adminParticipantQuery, "useAdminParticipantListQuery")
        .mockReturnValue({
          data: { groupName: "테스트 소모임", participants: [] },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);
      const participantFallbackSpy = vi
        .spyOn(participantListQuery, "useParticipantListQuery")
        .mockReturnValue({
          data: {
            participants: [],
            teams: [],
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof participantListQuery.useParticipantListQuery>);

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      expect(myProfileSpy).toHaveBeenCalledWith("17", { enabled: true });
      expect(profileDetailSpy).toHaveBeenCalledWith("17", "202", {
        detailRole: "admin",
        enabled: false,
      });
      expect(adminFallbackSpy).not.toHaveBeenCalled();
      expect(participantFallbackSpy).not.toHaveBeenCalled();
      expect(screen.getByText("이순신")).toBeInTheDocument();
    });

    it("상세 프로필 조회가 실패해도 전체 참가자 목록 fallback을 조회하지 않는다", () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: mockAdminGroup,
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);
      vi.spyOn(myGroupProfileQuery, "useMyGroupProfileQuery").mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      } as ReturnType<typeof myGroupProfileQuery.useMyGroupProfileQuery>);
      vi.spyOn(
        participantProfileQuery,
        "useParticipantProfileQuery",
      ).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
      } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);
      const adminFallbackSpy = vi
        .spyOn(adminParticipantQuery, "useAdminParticipantListQuery")
        .mockReturnValue({
          data: mockAdminParticipants,
          isLoading: false,
          isError: false,
        } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);
      const participantFallbackSpy = vi
        .spyOn(participantListQuery, "useParticipantListQuery")
        .mockReturnValue({
          data: {
            participants: [],
            teams: [],
          },
          isLoading: false,
          isError: false,
        } as ReturnType<typeof participantListQuery.useParticipantListQuery>);

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      expect(adminFallbackSpy).not.toHaveBeenCalled();
      expect(participantFallbackSpy).not.toHaveBeenCalled();
      expect(screen.queryByText("이순신")).not.toBeInTheDocument();
    });

    it("관리자 뷰에서 차단 버튼 클릭 시 차단 사유 입력 모달이 열리고 30자 이내 입력 시 차단이 정상 수행된다", async () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: mockAdminGroup,
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      vi.spyOn(
        adminParticipantQuery,
        "useAdminParticipantListQuery",
      ).mockReturnValue({
        data: mockAdminParticipants,
      } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);

      vi.spyOn(participantListQuery, "useParticipantListQuery").mockReturnValue({
        data: {
          participants: [mockParticipantProfile],
          teams: [],
        },
        isLoading: false,
        isError: false,
      });

      vi.spyOn(
        participantProfileQuery,
        "useParticipantProfileQuery",
      ).mockReturnValue({
        data: mockParticipantProfile,
      } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);

      vi.spyOn(blacklistApi, "blockParticipantApi").mockResolvedValue({
        ok: true,
        source: "api",
      });

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      await waitFor(() => {
        expect(screen.getByText("이순신")).toBeInTheDocument();
      });

      const blockBtn = screen.getByLabelText("참가자 그룹 차단");
      expect(blockBtn).toBeInTheDocument();

      fireEvent.click(blockBtn);

      await waitFor(() => {
        expect(
          screen.getByText("참가자를 그룹에서 차단하시겠습니까?"),
        ).toBeInTheDocument();
        expect(screen.getByText("0/30")).toBeInTheDocument();
      });

      const submitBlockBtn = screen.getByRole("button", { name: "차단하기" });

      // 사유 입력 후 차단 완료
      const textarea = screen.getByPlaceholderText(
        /차단 사유를 입력해주세요/,
      );
      fireEvent.change(textarea, {
        target: { value: "지속적인 불참 및 운영 방해" },
      });

      expect(screen.getByText("15/30")).toBeInTheDocument();

      fireEvent.click(submitBlockBtn);

      await waitFor(() => {
        expect(blacklistApi.blockParticipantApi).toHaveBeenCalledWith(
          "17",
          expect.objectContaining({ id: "202", name: "이순신" }),
          { reason: "지속적인 불참 및 운영 방해" },
        );
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining("/groups/17/participants"),
        );
        expect(sessionStorage.getItem("adminToast")).toBe(
          "이순신님을 그룹에서 차단했습니다.",
        );
      });
    });

    it("2차 준비중(round=2)에서 참가자 차단 시 1차 기본 탭이 아닌 2차 준비중 참가자 목록(?round=2)으로 이동한다", async () => {
      mockSearchParams.set("round", "2");
      mockSearchParams.set("role", "admin");

      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: {
          ...mockAdminGroup,
          status: "BEFORE_SECOND_ROUND",
        },
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      vi.spyOn(
        adminParticipantQuery,
        "useAdminParticipantListQuery",
      ).mockReturnValue({
        data: mockAdminParticipants,
      } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);

      vi.spyOn(participantListQuery, "useParticipantListQuery").mockReturnValue({
        data: {
          participants: [mockParticipantProfile],
          teams: [],
        },
        isLoading: false,
        isError: false,
      });

      vi.spyOn(
        participantProfileQuery,
        "useParticipantProfileQuery",
      ).mockReturnValue({
        data: mockParticipantProfile,
      } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);

      vi.spyOn(blacklistApi, "blockParticipantApi").mockResolvedValue({
        ok: true,
        source: "api",
      });

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      await waitFor(() => {
        expect(screen.getByText("이순신")).toBeInTheDocument();
      });

      const blockBtn = screen.getByLabelText("참가자 그룹 차단");
      expect(blockBtn).toBeInTheDocument();
      fireEvent.click(blockBtn);

      const textarea = screen.getByPlaceholderText(/차단 사유를 입력해주세요/);
      fireEvent.change(textarea, { target: { value: "2차 불참" } });

      const submitBlockBtn = screen.getByRole("button", { name: "차단하기" });
      fireEvent.click(submitBlockBtn);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining("/groups/17/admin/participants?round=2"),
        );
      });
    });

    it("from 파라미터가 있는 경우 차단 완료 후 해당 from 경로로 정확히 복귀한다", async () => {
      mockSearchParams.set("role", "admin");
      mockSearchParams.set("from", "/groups/17/admin/assignment/fixed?round=2");

      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: {
          ...mockAdminGroup,
          status: "BEFORE_SECOND_ROUND",
        },
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      vi.spyOn(
        adminParticipantQuery,
        "useAdminParticipantListQuery",
      ).mockReturnValue({
        data: mockAdminParticipants,
      } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);

      vi.spyOn(participantListQuery, "useParticipantListQuery").mockReturnValue({
        data: {
          participants: [mockParticipantProfile],
          teams: [],
        },
        isLoading: false,
        isError: false,
      });

      vi.spyOn(
        participantProfileQuery,
        "useParticipantProfileQuery",
      ).mockReturnValue({
        data: mockParticipantProfile,
      } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);

      vi.spyOn(blacklistApi, "blockParticipantApi").mockResolvedValue({
        ok: true,
        source: "api",
      });

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      await waitFor(() => {
        expect(screen.getByText("이순신")).toBeInTheDocument();
      });

      const blockBtn = screen.getByLabelText("참가자 그룹 차단");
      fireEvent.click(blockBtn);

      const submitBlockBtn = screen.getByRole("button", { name: "차단하기" });
      fireEvent.click(submitBlockBtn);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/groups/17/admin/assignment/fixed?round=2",
        );
      });
    });

    it("tab 파라미터가 있는 경우 차단 완료 후 탭 쿼리가 보존된 참가자 목록 경로로 복귀한다", async () => {
      mockSearchParams.set("role", "admin");
      mockSearchParams.set("tab", "staff");

      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: mockAdminGroup,
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      vi.spyOn(
        adminParticipantQuery,
        "useAdminParticipantListQuery",
      ).mockReturnValue({
        data: mockAdminParticipants,
      } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);

      vi.spyOn(participantListQuery, "useParticipantListQuery").mockReturnValue({
        data: {
          participants: [mockParticipantProfile],
          teams: [],
        },
        isLoading: false,
        isError: false,
      });

      vi.spyOn(
        participantProfileQuery,
        "useParticipantProfileQuery",
      ).mockReturnValue({
        data: null,
      } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);

      vi.spyOn(blacklistApi, "blockParticipantApi").mockResolvedValue({
        ok: true,
        source: "api",
      });

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      await waitFor(() => {
        expect(screen.getByText("이순신")).toBeInTheDocument();
      });

      const blockBtn = screen.getByLabelText("참가자 그룹 차단");
      fireEvent.click(blockBtn);

      const submitBlockBtn = screen.getByRole("button", { name: "차단하기" });
      fireEvent.click(submitBlockBtn);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/groups/17/team?tab=staff",
        );
      });
    });

    it("투표 결과/2차 참가자 목록(list=second-round)에서 차단 시 2차 참가자 목록으로 복귀한다", async () => {
      mockSearchParams.set("role", "admin");
      mockSearchParams.set("list", "second-round");

      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: {
          ...mockAdminGroup,
          status: "BEFORE_SECOND_ROUND",
        },
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      vi.spyOn(
        adminParticipantQuery,
        "useAdminParticipantListQuery",
      ).mockReturnValue({
        data: mockAdminParticipants,
      } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);

      vi.spyOn(participantListQuery, "useParticipantListQuery").mockReturnValue({
        data: {
          participants: [mockParticipantProfile],
          teams: [],
        },
        isLoading: false,
        isError: false,
      });

      vi.spyOn(
        participantProfileQuery,
        "useParticipantProfileQuery",
      ).mockReturnValue({
        data: mockParticipantProfile,
      } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);

      vi.spyOn(blacklistApi, "blockParticipantApi").mockResolvedValue({
        ok: true,
        source: "api",
      });

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      await waitFor(() => {
        expect(screen.getByText("이순신")).toBeInTheDocument();
      });

      const blockBtn = screen.getByLabelText("참가자 그룹 차단");
      fireEvent.click(blockBtn);

      const submitBlockBtn = screen.getByRole("button", { name: "차단하기" });
      fireEvent.click(submitBlockBtn);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          "/groups/17/participants?list=second-round",
        );
      });
    });

    it("서버에서 에러 반환 시 에러 메시지가 모달 내에 표시된다 (예: 409 조 편성 전만 가능)", async () => {
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: mockAdminGroup,
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);

      vi.spyOn(
        adminParticipantQuery,
        "useAdminParticipantListQuery",
      ).mockReturnValue({
        data: mockAdminParticipants,
      } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);

      vi.spyOn(participantListQuery, "useParticipantListQuery").mockReturnValue({
        data: {
          participants: [mockParticipantProfile],
          teams: [],
        },
        isLoading: false,
        isError: false,
      });

      vi.spyOn(
        participantProfileQuery,
        "useParticipantProfileQuery",
      ).mockReturnValue({
        data: mockParticipantProfile,
      } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);

      vi.spyOn(blacklistApi, "blockParticipantApi").mockRejectedValue(
        new Error("1차 진행 이전(조 편성 전)에만 참가자를 삭제할 수 있습니다."),
      );

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      await waitFor(() => {
        expect(screen.getByText("이순신")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText("참가자 그룹 차단"));

      await waitFor(() => {
        expect(
          screen.getByText("참가자를 그룹에서 차단하시겠습니까?"),
        ).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/차단 사유를 입력해주세요/);
      fireEvent.change(textarea, { target: { value: "비매너" } });

      const submitBlockBtn = screen.getByRole("button", { name: "차단하기" });
      fireEvent.click(submitBlockBtn);

      await waitFor(() => {
        expect(
          screen.getByText(
            "1차 진행 이전(조 편성 전)에만 참가자를 삭제할 수 있습니다.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("관리자 본인 프로필 조회 시 차단 버튼이 노출되지 않는다", async () => {
      // myParticipantId가 202인 상태로 설정
      vi.spyOn(adminGroupQuery, "useAdminGroupQuery").mockReturnValue({
        data: {
          ...mockAdminGroup,
          myParticipantId: 202,
        },
      } as ReturnType<typeof adminGroupQuery.useAdminGroupQuery>);
      vi.spyOn(myGroupProfileQuery, "useMyGroupProfileQuery").mockReturnValue({
        data: {
          id: "202",
          displayName: "이순신",
          position: "MEMBER",
          major: "경영학과",
          isNew: false,
          grade: "SECOND",
          gender: "MALE",
          mbti: "ISTJ",
          age: 22,
          instaId: "sunshin",
          bio: "안녕하세요",
          visibility: "PUBLIC",
        },
        isLoading: false,
        isError: false,
      } as ReturnType<typeof myGroupProfileQuery.useMyGroupProfileQuery>);

      vi.spyOn(
        adminParticipantQuery,
        "useAdminParticipantListQuery",
      ).mockReturnValue({
        data: mockAdminParticipants,
      } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);

      vi.spyOn(participantListQuery, "useParticipantListQuery").mockReturnValue({
        data: {
          participants: [mockParticipantProfile],
          teams: [],
        },
        isLoading: false,
        isError: false,
      });

      vi.spyOn(
        participantProfileQuery,
        "useParticipantProfileQuery",
      ).mockReturnValue({
        data: null,
      } as ReturnType<typeof participantProfileQuery.useParticipantProfileQuery>);

      render(
        <ParticipantProfileScreen groupId="17" participantId="202" />,
      );

      await waitFor(() => {
        expect(screen.getByText("이순신")).toBeInTheDocument();
      });

      // 본인 프로필이므로 차단 버튼이 화면에 없어야 함
      expect(screen.queryByLabelText("참가자 그룹 차단")).not.toBeInTheDocument();
    });
  });

  describe("HomeScreen - Blocked User Group Entry Prevention", () => {
    it("추방/차단된 사용자가 홈에서 해당 그룹을 클릭하면 차단 사유 알림 팝업이 표시되고 입장이 제한된다", async () => {
      vi.spyOn(groupApi, "getMyGroupsApi").mockImplementation(
        async (params) => {
          if (params?.state === "active") {
            return {
              groups: [
                {
                  groupId: 17,
                  groupName: "금요 러닝 크루",
                  status: "RECRUITING",
                  role: "PARTICIPANT",
                  memberCount: 8,
                },
              ],
            };
          }
          return { groups: [] };
        },
      );

      vi.spyOn(blacklistApi, "checkUserBlockedInGroup").mockResolvedValue({
        id: "99",
        userId: 99,
        name: "홍길동",
        displayName: "홍길동",
        department: "컴퓨터공학과",
        gender: "male",
        role: "general",
        visibility: "public",
        grade: "3학년",
        mbti: "ENFP",
        email: "gildong@example.com",
        reason: "모임 불참 및 비매너 행위로 인한 영구 차단",
        blockedAt: "2026-08-30T00:00:00.000Z",
        bannedAt: "2026-08-30T00:00:00.000Z",
        isNew: false,
      });

      render(<HomeScreen userName="홍길동" />);

      await waitFor(() => {
        expect(screen.getByText("금요 러닝 크루")).toBeInTheDocument();
      });

      // 그룹 카드 클릭
      const groupCard = screen.getByText("금요 러닝 크루");
      fireEvent.click(groupCard);

      // 차단 사유 팝업 확인
      await waitFor(() => {
        expect(screen.getByText("그룹 이용 제한 안내")).toBeInTheDocument();
        expect(
          screen.getByText(/관리자에 의해 해당 그룹에서 차단되었습니다\.\s*차단 사유: 모임 불참 및 비매너 행위로 인한 영구 차단/),
        ).toBeInTheDocument();
        // 라우터 이동 방지 확인
        expect(mockPush).not.toHaveBeenCalled();
      });

      // 목록에서 삭제하기 버튼 클릭 시 모달 닫히고 목록에서 삭제됨
      const deleteButton = screen.getByRole("button", { name: "목록에서 삭제하기" });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.queryByText("금요 러닝 크루"),
        ).not.toBeInTheDocument();
      });
    });

    it("진행 중인 모임 및 완료된 모임 탭 간 전환이 정상 동작하고 각 Empty State가 표시된다", async () => {
      vi.spyOn(blacklistApi, "checkUserBlockedInGroup").mockResolvedValue(null);
      vi.spyOn(groupApi, "getMyGroupsApi").mockImplementation(
        async (params) => {
          if (params?.state === "active") {
            return {
              groups: [
                {
                  groupId: 101,
                  groupName: "활성 프로젝트 모임",
                  status: "FIRST_ROUND",
                  role: "HOST",
                  memberCount: 6,
                },
              ],
            };
          }
          if (params?.state === "finished") {
            return {
              groups: [
                {
                  groupId: 102,
                  groupName: "지난 주말 뒤풀이",
                  status: "FINISHED",
                  role: "PARTICIPANT",
                  memberCount: 12,
                },
              ],
            };
          }
          return { groups: [] };
        },
      );

      render(<HomeScreen userName="홍길동" />);

      // 1. 기본 탭 (진행 중인 모임) 활성화 확인
      const activeTab = screen.getByRole("tab", { name: "진행 중인 모임" });
      const completedTab = screen.getByRole("tab", { name: "완료된 모임" });

      expect(activeTab).toHaveAttribute("aria-selected", "true");
      expect(completedTab).toHaveAttribute("aria-selected", "false");

      await waitFor(() => {
        expect(screen.getByText("활성 프로젝트 모임")).toBeInTheDocument();
      });

      // 2. 완료된 모임 탭 클릭
      fireEvent.click(completedTab);
      expect(completedTab).toHaveAttribute("aria-selected", "true");
      expect(activeTab).toHaveAttribute("aria-selected", "false");

      await waitFor(() => {
        expect(screen.getByText("지난 주말 뒤풀이")).toBeInTheDocument();
        expect(screen.queryByText("활성 프로젝트 모임")).not.toBeInTheDocument();
      });

      // 3. 완료된 모임 클릭 시 이동하지 않고 단순 조회만 가능
      fireEvent.click(screen.getByText("지난 주말 뒤풀이"));
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("그룹 목록이 없을 때 각 탭별로 적절한 안내 문구가 표시된다", async () => {
      vi.spyOn(groupApi, "getMyGroupsApi").mockResolvedValue({ groups: [] });

      render(<HomeScreen userName="홍길동" />);

      // 진행 중인 모임 Empty State
      await waitFor(() => {
        expect(screen.getByText("진행 중인 모임이 없습니다.")).toBeInTheDocument();
      });

      // 완료된 모임 탭 전환 후 Empty State
      const completedTab = screen.getByRole("tab", { name: "완료된 모임" });
      fireEvent.click(completedTab);

      await waitFor(() => {
        expect(screen.getByText("완료된 모임이 없습니다.")).toBeInTheDocument();
      });
    });
  });

  describe("Blacklist API - Non-optimistic Synchronous Update", () => {
    it("blockParticipantApi 호출 시 서버 에러(409 등) 발생 시 localStorage가 미리 변경되지 않고 에러를 던진다", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          message: "1차 진행 이전(조 편성 전)에만 참가자를 삭제할 수 있습니다.",
        }),
      } as Response);

      await expect(
        blacklistApi.blockParticipantApi(
          "17",
          mockParticipantProfile,
          { reason: "비매너" },
        ),
      ).rejects.toThrow("1차 진행 이전(조 편성 전)에만 참가자를 삭제할 수 있습니다.");

      // 로컬 스토리지에 유저가 추가되지 않았음을 검증 (낙관적 업데이트 없음)
      const stored = blacklistApi.readStoredBlacklist("17");
      expect(stored.find((item) => item.id === "202")).toBeUndefined();
      fetchSpy.mockRestore();
    });

    it("blockParticipantApi 호출 시 서버 성공(200/204) 시에만 localStorage에 저장된다", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response);

      const result = await blacklistApi.blockParticipantApi(
        "17",
        mockParticipantProfile,
        { reason: "비매너" },
      );

      expect(result.ok).toBe(true);
      expect(result.source).toBe("api");

      // 서버 성공 후에만 로컬 스토리지에 저장됨
      const stored = blacklistApi.readStoredBlacklist("17");
      expect(stored.find((item) => item.id === "202")).toBeDefined();
      fetchSpy.mockRestore();
    });

    it("unblockParticipantApi 호출 시 서버 실패 시 localStorage에서 삭제되지 않고 에러를 던진다", async () => {
      // 미리 차단 목록에 유저를 기록
      blacklistApi.writeStoredBlacklist("17", [
        {
          ...mockParticipantProfile,
          userId: 202,
          reason: "테스트",
          blockedAt: new Date().toISOString(),
        },
      ]);

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "서버 내부 오류" }),
      } as Response);

      await expect(
        blacklistApi.unblockParticipantApi("17", 202),
      ).rejects.toThrow("서버 내부 오류");

      // 로컬 스토리지에 여전히 유저가 유지됨
      const stored = blacklistApi.readStoredBlacklist("17");
      expect(stored.find((item) => item.id === "202" || item.userId === 202)).toBeDefined();
      fetchSpy.mockRestore();
    });

    it("blockParticipantApi 호출 시 이메일이 없는 참가자는 가짜 @example.com을 생성하지 않고 빈 문자열 또는 실제 이메일만 저장한다", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response);

      await blacklistApi.blockParticipantApi(
        "17",
        { id: "303", name: "수동참가자" },
        { reason: "노쇼" },
      );

      const stored = blacklistApi.readStoredBlacklist("17");
      const blocked = stored.find((item) => item.id === "303");
      expect(blocked).toBeDefined();
      expect(blocked?.email).toBe("");
      expect(blocked?.email).not.toContain("@example.com");
      fetchSpy.mockRestore();
    });

    it("getGroupBlacklist 호출 시 동일한 유저가 여러 번 포함되어도 1개로 중복 제거된다", async () => {
      const groupDetailSpy = vi.spyOn(groupApi, "getGroupDetail").mockResolvedValue({
        groupId: 17,
        groupName: "테스트 모임",
        status: "RECRUITING",
        myRole: "HOST",
        hasPassword: false,
        memberCount: 5,
        targetRound: 1,
        maxCapacity: 20,
      });

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          banList: [
            {
              userId: 101,
              displayName: "홍길동",
              email: "gildong@real.com",
              reason: "비매너",
              bannedAt: "2026-03-01T10:00:00Z",
            },
            {
              userId: 101,
              displayName: "홍길동",
              email: "gildong@real.com",
              reason: "비매너 수정",
              bannedAt: "2026-03-01T10:00:00Z",
            },
          ],
        }),
      } as Response);

      const result = await blacklistApi.getGroupBlacklist("17");
      expect(result.participants.length).toBe(1);
      expect(result.participants[0].userId).toBe(101);
      expect(result.participants[0].displayName).toBe("홍길동");

      fetchSpy.mockRestore();
      groupDetailSpy.mockRestore();
    });
  });

  describe("BlockedUserProfileModal - Simplified UI", () => {
    it("차단 프로필 모달에 이름, 이메일, 차단일시, 차단사유만 노출되고 온보딩 상세 필드는 노출되지 않는다", () => {
      render(
        <BlockedUserProfileModal
          groupId="17"
          participant={{
            id: "101",
            userId: 101,
            name: "홍길동",
            displayName: "홍길동",
            email: "gildong@real.com",
            reason: "비매너 행위",
            blockedAt: "2026-03-01T10:00:00Z",
            bannedAt: "2026-03-01T10:00:00Z",
            // 과도한 온보딩 정보가 객체에 있더라도 모달에는 노출되지 않아야 함
            grade: "4학년",
            mbti: "ENFP",
            age: 25,
            instagramId: "gildong_insta",
            bio: "안녕하세요 자기소개입니다",
          }}
          onClose={vi.fn()}
          onUnblockSuccess={vi.fn()}
        />,
      );

      // 필수 최소 정보 노출 확인
      expect(screen.getByText("홍길동")).toBeInTheDocument();
      expect(screen.getByText("gildong@real.com")).toBeInTheDocument();
      expect(screen.getByText("비매너 행위")).toBeInTheDocument();
      expect(screen.getByText("차단됨")).toBeInTheDocument();

      // 온보딩 과도 정보 비노출 확인
      expect(screen.queryByText("4학년")).not.toBeInTheDocument();
      expect(screen.queryByText("ENFP")).not.toBeInTheDocument();
      expect(screen.queryByText("25세")).not.toBeInTheDocument();
      expect(screen.queryByText("@gildong_insta")).not.toBeInTheDocument();
      expect(screen.queryByText("gildong_insta")).not.toBeInTheDocument();
      expect(screen.queryByText("안녕하세요 자기소개입니다")).not.toBeInTheDocument();
    });
  });

  describe("GroupJoinScreen & AdminGroupQueryProvider - Block Reason Display", () => {
    it("GroupJoinScreen에서 차단된 사용자가 코드를 제출하면 차단 사유가 포함된 에러 모달이 표시된다", async () => {
      vi.spyOn(groupApi, "verifyInviteCodeApi").mockRejectedValue(
        new groupApi.GroupApiError(
          "이 그룹에 참여하고 있지 않거나 차단되었습니다.",
          403,
          "USER_BLOCKED",
          undefined,
          "지속적인 노쇼 및 비매너 행위",
        ),
      );

      render(<GroupJoinScreen />);

      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBe(6);

      // OTP 6자리 입력
      "ABC123".split("").forEach((char, i) => {
        fireEvent.change(inputs[i], { target: { value: char } });
      });

      const submitButton = screen.getByRole("button", { name: "입장하기" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("그룹 참여가 제한되었습니다")).toBeInTheDocument();
        expect(
          screen.getByText(/그룹에서 차단되었습니다\.\s*차단 사유: 지속적인 노쇼 및 비매너 행위/),
        ).toBeInTheDocument();
      });

      // 홈으로 이동 버튼 클릭
      const homeBtn = screen.getByRole("button", { name: "홈으로 이동" });
      fireEvent.click(homeBtn);
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });

    it("AdminGroupQueryProvider에서 차단(403) 및 사유 반환 시 화면에 차단 사유가 표시된다", async () => {
      vi.spyOn(groupApi, "getGroupDetail").mockRejectedValue(
        new groupApi.GroupApiError(
          "이 그룹에 참여하고 있지 않거나 차단되었습니다.",
          403,
          "USER_BLOCKED",
          undefined,
          "운영 방해로 인한 퇴장",
        ),
      );

      render(
        <AdminGroupQueryProvider>
          <div>콘텐츠</div>
        </AdminGroupQueryProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByText(/그룹에서 차단되었습니다\.\s*차단 사유: 운영 방해로 인한 퇴장/),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "홈으로 이동" })).toBeInTheDocument();
      });
    });

    it("GroupExtraInfoScreen에서 참가자가 프로필 제출 시 차단(403)되면 차단 사유 모달이 표시되고 홈으로 이동할 수 있다", async () => {
      mockSearchParams = new Map<string, string>([["inviteCode", "JOIN123"]]);

      vi.spyOn(groupApi, "joinGroupWithProfileApi").mockRejectedValue(
        new groupApi.GroupApiError(
          "해당 그룹 관리자에 의해 참여가 차단된 사용자입니다.",
          403,
          "USER_BLOCKED",
          undefined,
          "경고 누적으로 인한 참여 제한",
        ),
      );

      render(
        <GroupExtraInfoScreen
          groupId="17"
          initialData={{
            name: "김철수",
            department: "경영학과",
            grade: "1학년",
            gender: "남",
            isNew: "신입",
            rolePosition: "일반",
            mbti: "ENFP",
          }}
        />,
      );

      const submitButton = screen.getByRole("button", { name: "저장하기" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("그룹 참여가 제한되었습니다")).toBeInTheDocument();
        expect(
          screen.getByText(/그룹에서 차단되었습니다\.\s*차단 사유: 경고 누적으로 인한 참여 제한/),
        ).toBeInTheDocument();
      });

      // 확인 / 홈으로 이동 버튼 클릭
      const homeBtn = screen.getByRole("button", { name: "홈으로 이동" });
      fireEvent.click(homeBtn);
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });

    it("extractErrorReason은 reason, data.reason, banReason, detail 등의 필드에서 실제 사유를 누락 없이 추출한다", () => {
      expect(groupApi.extractErrorReason({ reason: "사유1" })).toBe("사유1");
      expect(groupApi.extractErrorReason({ data: { reason: "사유2" } })).toBe("사유2");
      expect(groupApi.extractErrorReason({ banReason: "사유3" })).toBe("사유3");
      expect(groupApi.extractErrorReason({ detail: "사유4" })).toBe("사유4");
      expect(
        groupApi.extractErrorReason({
          reason: "관리자에 의해 해당 그룹에서 차단되었습니다.",
        }),
      ).toBeUndefined();
    });
  });
});
