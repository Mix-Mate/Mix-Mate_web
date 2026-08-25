"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import { getEventStatusLabel } from "@/features/session/model/event-status";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import MyTeamPanel from "@/features/team/components/MyTeamPanel";
import TeamSectionTabs from "@/features/team/components/TeamSectionTabs";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import type { TeamMember, TeamRound } from "@/features/team/types/team.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./MyTeamScreen.module.css";

export default function MyTeamScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const [privateMember, setPrivateMember] = useState<TeamMember | null>(null);
  const { data: group } = useAdminGroupQuery(params.groupId);

  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
    group?.myRole === "HOST" ? "ADMIN" : "USER",
  );
  const round: TeamRound =
    snapshot.round === 2 ? "SECOND_ROUND" : "FIRST_ROUND";
  const {
    data: team,
    isLoading,
    error,
  } = useMyTeamQuery(params.groupId, round);
  const activeTab = searchParams.get("tab") === "members" ? "members" : "team";
  const currentStatusLabel = getEventStatusLabel(snapshot.currentStatus);

  const handleMemberSelect = (member: TeamMember) => {
    if (member.visibility === "PRIVATE") {
      setPrivateMember(member);
      return;
    }

    router.push(
      `/groups/${params.groupId}/participants/${member.participantId}`,
    );
  };

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.phone}
      fillHeight
      data-testid="my-team-screen"
      data-scenario={snapshot.scenario}
      data-role={snapshot.role}
    >
      <Header
        title={snapshot.groupName}
        onBack={() =>
          router.push(
            withSessionContext(groupRoutes.home(params.groupId), searchParams),
          )
        }
        backLabel="사용자 홈으로 이동"
      />

      <TeamSectionTabs
        groupId={params.groupId}
        activeSection={activeTab}
        onNavigate={(href) =>
          router.push(withSessionContext(href, searchParams))
        }
      />

      {activeTab === "team" ? (
        <div className={styles.content}>
          <section
            className={styles.assignmentOrb}
            aria-label={
              isLoading
                ? "내 조 정보를 불러오는 중입니다."
                : error
                  ? "내 조 정보를 불러오지 못했습니다."
                  : team
                    ? `${team.teamNumber}조에 배정되었습니다.`
                    : "내 조 정보가 없습니다."
            }
          >
            <span>내 조</span>
            <strong>
              {isLoading ? "…" : team ? `${team.teamNumber}조` : "—"}
            </strong>
          </section>

          <p
            className={styles.statusText}
            aria-label={`현재 진행 상태: ${currentStatusLabel}`}
          >
            진행 상태 · {currentStatusLabel}
          </p>
          {error && (
            <p className={styles.queryError} role="alert">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className={styles.membersContent}>
          {isLoading ? (
            <p className={styles.queryState} role="status">
              같은 조 멤버를 불러오는 중입니다.
            </p>
          ) : error ? (
            <p
              className={`${styles.queryState} ${styles.queryError}`}
              role="alert"
            >
              {error}
            </p>
          ) : team ? (
            <MyTeamPanel team={team} onMemberSelect={handleMemberSelect} />
          ) : null}
        </div>
      )}

      <BottomSheetDialog
        open={privateMember !== null}
        titleId="private-team-profile-title"
        sheetClassName={styles.privateProfileSheet}
        onClose={() => setPrivateMember(null)}
      >
        {privateMember && (
          <div className={styles.privateProfileContent}>
            <h2>{privateMember.displayName}</h2>
            <p>{privateMember.major}</p>

            <div className={styles.privateProfileDivider} />

            <section className={styles.privateProfileNotice}>
              <LockKeyhole aria-hidden="true" size={34} />
              <strong id="private-team-profile-title">
                비공개 프로필입니다
              </strong>
              <span>
                해당 참가자의 상세 프로필
                <br />
                정보는 확인할 수 없습니다.
              </span>
            </section>

            <Button onClick={() => setPrivateMember(null)}>닫기</Button>
          </div>
        )}
      </BottomSheetDialog>
    </MobileFrame>
  );
}
