import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import BlacklistScreen from "@/screens/admin/BlacklistScreen";
import ParticipantProfileScreen from "@/screens/common/ParticipantProfileScreen";
import HomeScreen from "@/screens/common/HomeScreen";
import ParticipantPageHeader from "@/features/participant/components/ParticipantPageHeader";
import * as blacklistApi from "./api/blacklist.api";
import * as groupApi from "@/features/group/api/group.api";
import * as adminGroupQuery from "@/features/group/hooks/useAdminGroupQuery";
import * as adminParticipantQuery from "@/features/participant/hooks/useAdminParticipantListQuery";
import * as participantListQuery from "@/features/participant/hooks/useParticipantListQuery";
import * as participantProfileQuery from "@/features/participant/hooks/useParticipantProfileQuery";
import type { BlockedParticipant } from "./types/blacklist.types";
import type { AdminParticipantGroup, ParticipantProfile } from "@/features/participant/types/participant.types";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: vi.fn(),
  }),
  useParams: () => ({ groupId: "17" }),
  useSearchParams: () => ({
    get: (key: string) => (key === "role" ? "admin" : null),
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
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
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
        expect(screen.getByText("컴퓨터공학과")).toBeInTheDocument();
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
        expect(screen.getByText("gildong@example.com")).toBeInTheDocument();
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
          groupName: "테스트 소모임",
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
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("/groups/17/admin/participants"),
        );
        expect(sessionStorage.getItem("adminToast")).toBe(
          "이순신님을 그룹에서 차단했습니다.",
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
          groupName: "테스트 소모임",
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

      vi.spyOn(
        adminParticipantQuery,
        "useAdminParticipantListQuery",
      ).mockReturnValue({
        data: mockAdminParticipants,
      } as ReturnType<typeof adminParticipantQuery.useAdminParticipantListQuery>);

      vi.spyOn(participantListQuery, "useParticipantListQuery").mockReturnValue({
        data: {
          groupName: "테스트 소모임",
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
        expect(screen.getByText("그룹에서 차단되었습니다")).toBeInTheDocument();
        expect(
          screen.getByText("모임 불참 및 비매너 행위로 인한 영구 차단"),
        ).toBeInTheDocument();
        // 라우터 이동 방지 확인
        expect(mockPush).not.toHaveBeenCalled();
      });

      // 확인 버튼 클릭 시 모달 닫힘
      const confirmButton = screen.getByRole("button", { name: "확인" });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.queryByText("그룹에서 차단되었습니다"),
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
});
