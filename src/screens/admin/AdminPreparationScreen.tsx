"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { UsersRound } from "lucide-react";
import { useCallback } from "react";
import AdminPreparationActions from "@/features/group/components/AdminPreparationActions";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { getGroupStatusLabel } from "@/features/group/model/group-status";
import SessionStatusCard from "@/features/session/components/SessionStatusCard";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./AdminPreparationScreen.module.css";

export default function AdminPreparationScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);

  const navigateWithSession = useCallback(
    (href: string) => {
      router.push(withSessionContext(href, searchParams));
    },
    [router, searchParams],
  );

  const viewFirstRoundParticipants = useCallback(() => {
    // TODO(first-round-participants-routing): 1차 참가자 명단 조회 화면이 구현되면 라우팅을 연결한다.
  }, []);

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      fillHeight
      data-testid="admin-preparation"
      data-group-id={group.groupId}
    >
      <Header title={group.groupName} onBack={() => router.back()} compact />

      <div className={`${styles.content} ${styles.firstRoundContent}`}>
        <SessionStatusCard
          eyebrow="진행 상태 확인"
          status={getGroupStatusLabel(group.status)}
          onClick={() =>
            navigateWithSession(groupRoutes.adminProgress(params.groupId))
          }
        />

        <AdminPreparationActions
          onStartAssignment={() =>
            navigateWithSession(
              groupRoutes.adminAssignmentSetup(params.groupId, 1),
            )
          }
          secondaryAction={{
            icon: <UsersRound aria-hidden="true" size={17} strokeWidth={1.8} />,
            label: "1차 참가자 명단 조회",
            onClick: viewFirstRoundParticipants,
          }}
          onEditProfile={() =>
            navigateWithSession(groupRoutes.profileEdit(params.groupId))
          }
          profileActionLabel="내 프로필 조회"
          footerPlacement="flow"
        />
      </div>
    </MobileFrame>
  );
}
