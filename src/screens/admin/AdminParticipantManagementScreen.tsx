"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AdminParticipantList from "@/features/participant/components/AdminParticipantList";
import { useAdminParticipantListQuery } from "@/features/participant/hooks/useAdminParticipantListQuery";
import type { ParticipantRole } from "@/features/participant/types/participant.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import SearchBar from "@/shared/ui/SearchBar";
import TabNavigation from "@/shared/ui/TabNavigation";
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
  const round = toAssignmentRound(searchParams.get("round") ?? "1");
  const { data } = useAdminParticipantListQuery(params.groupId, round);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const stats = useMemo(
    () => ({
      total: data.participants.length,
      staff: data.participants.filter((participant) => participant.role === "staff")
        .length,
      freshman: data.participants.filter((participant) => participant.isNew)
        .length,
    }),
    [data.participants],
  );

  const filteredParticipants = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    return data.participants.filter((participant) => {
      const matchesKeyword =
        !trimmedKeyword || participant.name.includes(trimmedKeyword);
      const matchesFilter = filter === "all" || participant.role === filter;

      return matchesKeyword && matchesFilter;
    });
  }, [data.participants, filter, keyword]);

  const goToAssignment = () => {
    router.push(groupRoutes.adminAssignmentSetup(params.groupId, round));
  };

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="admin-participant-management"
    >
      <Header title={data.groupName} onBack={() => router.back()} />

      <TabNavigation
        items={[
          { id: "participants", label: "참가자" },
          { id: "assignment", label: "조 편성" },
        ]}
        activeItemId="participants"
        ariaLabel="관리자 메뉴"
        onSelect={(item) => {
          if (item.id === "assignment") goToAssignment();
        }}
      />

      <main className={styles.content}>
        <section className={styles.statsGrid} aria-label="참가자 통계">
          <article>
            <strong>{stats.total}</strong>
            <span>전체</span>
          </article>
          <article>
            <strong>{stats.staff}</strong>
            <span>운영진</span>
          </article>
          <article>
            <strong>{stats.freshman}</strong>
            <span>신입</span>
          </article>
        </section>

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

          <button
            type="button"
            className={styles.addButton}
            onClick={() =>
              router.push(
                `/groups/${params.groupId}/admin/participants/new?round=${round}`,
              )
            }
          >
            사용자 추가
          </button>
        </div>

        <section className={styles.listCard} aria-label="참가자 목록">
          <AdminParticipantList
            groupId={params.groupId}
            participants={filteredParticipants}
            round={round}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        <Button onClick={goToAssignment} className={styles.assignmentButton}>
          조 편성
        </Button>
      </footer>
    </MobileFrame>
  );
}
