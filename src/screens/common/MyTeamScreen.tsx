"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import MyTeamPanel from "@/features/team/components/MyTeamPanel";
import TeamSectionTabs from "@/features/team/components/TeamSectionTabs";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import type { TeamMemberSummary } from "@/features/team/types/team.types";
import Header from "@/shared/ui/Header";
import styles from "./MyTeamScreen.module.css";

export default function MyTeamScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
  );
  const { data: team } = useMyTeamQuery(params.groupId);
  const activeTab = searchParams.get("tab") === "members" ? "members" : "team";

  const handleMemberSelect = (member: TeamMemberSummary) => {
    if (member.profileVisibility === "PRIVATE") {
      // TODO(profile-integration): 비공개 프로필 모달 담당자의 구현이 완료되면 member.id를 전달해 모달을 연다.
      return;
    }

    // TODO(profile-integration): 공개 프로필 페이지 담당자의 구현이 완료되면 아래 경로로 이동을 연결한다.
    // router.push(`/groups/${params.groupId}/participants/${member.id}`);
  };

  return (
    <main className={styles.viewport}>
      <section
        className={styles.phone}
        data-testid="my-team-screen"
        data-scenario={snapshot.scenario}
      >
        <Header
          title={snapshot.groupName}
          roleLabel={snapshot.roleLabel}
          onBack={() => router.push(`/groups/${params.groupId}/home`)}
          backLabel="사용자 홈으로 이동"
        />

        <TeamSectionTabs
          groupId={params.groupId}
          activeSection={activeTab}
          onNavigate={(href) => router.push(href)}
        />

        {activeTab === "team" ? (
          <div className={styles.content}>
            <section
              className={styles.assignmentOrb}
              aria-label={
                snapshot.teamNumber === null
                  ? "아직 조가 배정되지 않았습니다"
                  : `${snapshot.teamNumber}조에 배정되었습니다`
              }
            >
              <span>나 몇 조?</span>
              <strong>
                {snapshot.teamNumber === null
                  ? "배정 전"
                  : `${snapshot.teamNumber}조`}
              </strong>
            </section>

            <p
              className={styles.statusText}
              aria-label={`현재 진행 상태: ${snapshot.statusLabel}`}
            >
              진행 상태 · {snapshot.statusLabel}
            </p>
          </div>
        ) : (
          <div className={styles.membersContent}>
            <MyTeamPanel team={team} onMemberSelect={handleMemberSelect} />
          </div>
        )}
      </section>
    </main>
  );
}
