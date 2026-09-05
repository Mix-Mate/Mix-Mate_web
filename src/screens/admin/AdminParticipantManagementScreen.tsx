"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, Menu } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AdminParticipantList from "@/features/participant/components/AdminParticipantList";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { getCurrentGroupRound } from "@/features/group/model/group-status";
import { useAdminParticipantListQuery } from "@/features/participant/hooks/useAdminParticipantListQuery";
import {
  enrichParticipantWithMyProfile,
  resolveMyParticipantId,
} from "@/features/participant/model/enrich-participant-with-my-profile";
import { useMyGroupProfileQuery } from "@/features/profile/hooks/useMyGroupProfileQuery";
import type { ParticipantRole } from "@/features/participant/types/participant.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import SearchBar from "@/shared/ui/SearchBar";
import TabNavigation from "@/shared/ui/TabNavigation";
import Toast from "@/shared/ui/Toast";
import useToast from "@/shared/hooks/useToast";
import styles from "./AdminParticipantManagementScreen.module.css";

type FilterValue = "all" | ParticipantRole;

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: "전체", value: "all" },
  { label: "일반", value: "general" },
  { label: "운영진", value: "staff" },
];

export default function AdminParticipantManagementScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const roundParam = searchParams.get("round");
  const round = roundParam
    ? toAssignmentRound(roundParam)
    : group
      ? getCurrentGroupRound(group.status)
      : 1;
  const isRoundResolved = Boolean(roundParam || group);
  const { data } = useAdminParticipantListQuery(params.groupId, round, {
    enabled: isRoundResolved,
    polling: group?.status === "RECRUITING" && round === 1,
  });
  const { data: myProfile } = useMyGroupProfileQuery(params.groupId);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const { message: toastMessage, showToast } = useToast();
  const canAddParticipant = round === 1;
  const myParticipantId = resolveMyParticipantId(
    myProfile,
    group?.myParticipantId,
  );
  const enrichedParticipants = useMemo(
    () =>
      data.participants.map((participant) =>
        enrichParticipantWithMyProfile(participant, myProfile, myParticipantId),
      ),
    [data.participants, myParticipantId, myProfile],
  );

  useEffect(() => {
    if (roundParam) {
      router.replace(
        withSessionContext(
          groupRoutes.adminParticipants(params.groupId),
          searchParams,
        ),
      );
    }
  }, [params.groupId, roundParam, router, searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("adminToast");
      if (stored) {
        showToast(stored);
        sessionStorage.removeItem("adminToast");
      }
    }
  }, [showToast]);

  const filteredParticipants = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    const participants = enrichedParticipants.filter((participant) => {
      const matchesKeyword =
        !trimmedKeyword || participant.name.includes(trimmedKeyword);
      const matchesFilter = filter === "all" || participant.role === filter;

      return matchesKeyword && matchesFilter;
    });

    return participants.sort((first, second) => {
      const firstIsMe = first.id === myParticipantId;
      const secondIsMe = second.id === myParticipantId;

      if (firstIsMe !== secondIsMe) return firstIsMe ? -1 : 1;

      const firstIsStaff = first.role === "staff";
      const secondIsStaff = second.role === "staff";

      if (firstIsStaff !== secondIsStaff) return firstIsStaff ? -1 : 1;

      return 0;
    });
  }, [enrichedParticipants, filter, myParticipantId, keyword]);

  const goToAssignment = () => {
    router.push(groupRoutes.adminAssignmentSetup(params.groupId, round));
  };

  const goToStatistics = () => {
    router.push(
      withSessionContext(
        groupRoutes.adminParticipantStatistics(params.groupId, round),
        searchParams,
      ),
    );
  };

  const handleNavigateBlacklist = () => {
    setMenuOpen(false);
    router.push(`/groups/${params.groupId}/admin/blacklist`);
  };

  const headerRightAction = (
    <div className={styles.menuWrapper}>
      <button
        type="button"
        className={styles.menuButton}
        aria-label="관리자 메뉴 열기"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <Menu aria-hidden="true" size={22} strokeWidth={1.8} />
      </button>

      {menuOpen && (
        <>
          <div
            className={styles.menuBackdrop}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.menuDropdown} role="menu">
            <button
              type="button"
              className={styles.menuItem}
              role="menuitem"
              onClick={handleNavigateBlacklist}
            >
              <Ban size={18} strokeWidth={2} />
              <span>그룹 차단 목록</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <MobileFrame data-testid="admin-participant-management">
      <Header
        title={group?.groupName ?? data.groupName}
        onBack={() =>
          router.push(
            withSessionContext(
              groupRoutes.adminPreparation(params.groupId),
              searchParams,
            ),
          )
        }
        rightAction={headerRightAction}
      />

      <TabNavigation
        items={[
          { id: "participants", label: "참가자" },
          { id: "statistics", label: "통계" },
          { id: "assignment", label: "조 편성" },
        ]}
        activeItemId="participants"
        ariaLabel="관리자 메뉴"
        onSelect={(item) => {
          if (item.id === "statistics") goToStatistics();
          if (item.id === "assignment") goToAssignment();
        }}
      />

      <main className={styles.content}>
        <SearchBar
          value={keyword}
          placeholder="이름 검색"
          onChange={setKeyword}
          className={styles.searchBar}
        />

        <div className={styles.filterRow}>
          <div className={styles.filters} aria-label="참가자 필터">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filter === option.value ? styles.activeFilter : ""}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {canAddParticipant && (
            <button
              type="button"
              className={styles.addButton}
              onClick={() =>
                router.push(
                  groupRoutes.adminParticipantNew(params.groupId, round),
                )
              }
            >
              사용자 추가
            </button>
          )}
        </div>

        <section className={styles.listCard} aria-label="참가자 목록">
          <AdminParticipantList
            groupId={params.groupId}
            participants={filteredParticipants}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        <Button onClick={goToAssignment}>조 편성</Button>
      </footer>

      {toastMessage && (
        <Toast className={styles.toast} role="status">
          {toastMessage}
        </Toast>
      )}
    </MobileFrame>
  );
}
