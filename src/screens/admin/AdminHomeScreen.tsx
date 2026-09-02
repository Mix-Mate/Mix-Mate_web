"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import AdminRecruitmentScreen from "./AdminRecruitmentScreen";
import AdminPreparationScreen from "./AdminPreparationScreen";
import ProgressScreen from "./ProgressScreen";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { withSessionContext } from "@/features/session/utils/session-navigation";

export default function AdminHomeScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group, isLoading } = useAdminGroupQuery(params.groupId);

  useEffect(() => {
    if (!group) return;

    if (group.myRole !== "HOST") {
      router.replace(
        withSessionContext(groupRoutes.userHome(params.groupId), searchParams),
      );
      return;
    }

    if (group.status === "FINISHED") {
      router.replace(
        withSessionContext(groupRoutes.completed(params.groupId), searchParams),
      );
    }
  }, [group, params.groupId, router, searchParams]);

  if (
    isLoading ||
    !group ||
    group.myRole !== "HOST" ||
    group.status === "VOTING" ||
    group.status === "FINISHED"
  ) {
    return null;
  }

  // 1. 1차/2차 준비 중 상태 (모집 완료 후 조편성 대기)
  if (
    group.status === "BEFORE_FIRST_ROUND" ||
    group.status === "BEFORE_SECOND_ROUND"
  ) {
    return <AdminPreparationScreen />;
  }

  // 2. 진행 중 상태
  if (
    group.status === "FIRST_ROUND" ||
    group.status === "SECOND_ROUND" ||
    group.status === "VOTE_CLOSED"
  ) {
    return <ProgressScreen />;
  }

  // 3. 모집 중 상태
  if (group.status === "RECRUITING") {
    return <AdminRecruitmentScreen />;
  }

  return null;
}
