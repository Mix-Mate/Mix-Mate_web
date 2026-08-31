"use client";

import { History, UsersRound } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import AdminPreparationActions from "@/features/group/components/AdminPreparationActions";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import {
  getGroupStatusLabel,
  getPreparationRound,
} from "@/features/group/model/group-status";
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
  const round = group ? getPreparationRound(group.status) : null;

  const navigateWithSession = useCallback(
    (href: string) => {
      router.push(withSessionContext(href, searchParams));
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (!group) return;

    if (group.status === "RECRUITING") {
      router.replace(
        withSessionContext(
          groupRoutes.adminRecruitment(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (
      group.status === "FIRST_ROUND" ||
      group.status === "SECOND_ROUND" ||
      group.status === "VOTING" ||
      group.status === "VOTE_CLOSED"
    ) {
      router.replace(
        withSessionContext(
          groupRoutes.adminProgress(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (group.status === "FINISHED") {
      router.replace(
        withSessionContext(
          groupRoutes.completed(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (!round) {
      router.replace(
        withSessionContext(groupRoutes.adminHome(params.groupId), searchParams),
      );
    }
  }, [group, params.groupId, round, router, searchParams]);

  if (!group || !round) return null;

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      fillHeight
      data-testid="admin-preparation"
      data-group-id={group.groupId}
      data-round={round}
    >
      <Header title={group.groupName} onBack={() => router.replace("/home")} compact />

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
              groupRoutes.adminParticipants(params.groupId, round),
            )
          }
          secondaryAction={{
            icon:
              round === 1 ? (
                <UsersRound aria-hidden="true" size={17} strokeWidth={1.8} />
              ) : (
                <History aria-hidden="true" size={17} strokeWidth={1.8} />
              ),
            label: `${round}차 참가자 명단 보기`,
            onClick: () =>
              navigateWithSession(
                groupRoutes.adminParticipants(params.groupId, round),
              ),
          }}
          onEditProfile={() =>
            navigateWithSession(groupRoutes.profile(params.groupId))
          }
          profileActionLabel="내 프로필 조회"
          footerPlacement="flow"
        />
      </div>
    </MobileFrame>
  );
}
