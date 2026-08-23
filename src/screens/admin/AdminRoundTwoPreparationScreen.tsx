"use client";

import { History } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

export default function AdminRoundTwoPreparationScreen() {
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

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="admin-round-two-preparation"
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
              groupRoutes.adminAssignmentSetup(params.groupId, 2),
            )
          }
          secondaryAction={{
            icon: <History aria-hidden="true" size={17} strokeWidth={1.8} />,
            label: "2차 참가자 명단 보기",
            onClick: () =>
              navigateWithSession(
                groupRoutes.adminRoundTwoParticipants(params.groupId),
              ),
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
