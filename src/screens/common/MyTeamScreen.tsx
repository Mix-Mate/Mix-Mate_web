"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import { getEventStatusLabel } from "@/features/session/model/event-status";
import {
  getMockGroupRole,
  withSessionContext,
} from "@/features/session/utils/session-navigation";
import MyTeamPanel from "@/features/team/components/MyTeamPanel";
import TeamSectionTabs from "@/features/team/components/TeamSectionTabs";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import type { TeamMemberSummary } from "@/features/team/types/team.types";
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
  const [privateMember, setPrivateMember] = useState<TeamMemberSummary | null>(
    null,
  );

  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
    getMockGroupRole(searchParams),
  );
  const { data: team } = useMyTeamQuery(params.groupId);
  const activeTab = searchParams.get("tab") === "members" ? "members" : "team";
  const currentStatusLabel = getEventStatusLabel(snapshot.currentStatus);

  const handleMemberSelect = (member: TeamMemberSummary) => {
    if (member.profileVisibility === "PRIVATE") {
      setPrivateMember(member);
      return;
    }

    router.push(`/groups/${params.groupId}/participants/${member.id}`);
  };

  return (
    <MobileFrame
      className={styles.phone}
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
              snapshot.teamNumber === null
                ? "아직 조가 배정되지 않았습니다."
                : `${snapshot.teamNumber}조에 배정되었습니다.`
            }
          >
            <span>내 조</span>
            <strong>
              {snapshot.teamNumber === null
                ? "배정 전"
                : `${snapshot.teamNumber}조`}
            </strong>
          </section>

          <p
            className={styles.statusText}
            aria-label={`현재 진행 상태: ${currentStatusLabel}`}
          >
            진행 상태 · {currentStatusLabel}
          </p>
        </div>
      ) : (
        <div className={styles.membersContent}>
          <MyTeamPanel team={team} onMemberSelect={handleMemberSelect} />
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

            <h2>{privateMember.name}</h2>
            <p>{privateMember.department}</p>

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
