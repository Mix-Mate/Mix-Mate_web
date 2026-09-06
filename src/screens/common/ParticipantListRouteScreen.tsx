"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import type { GroupStatus } from "@/features/group/types/group.types";
import AdminParticipantManagementScreen from "@/screens/admin/AdminParticipantManagementScreen";
import ParticipantListScreen from "./ParticipantListScreen";

function shouldUseAdminParticipantManagement(status: GroupStatus | undefined) {
  return (
    status === "RECRUITING" ||
    status === "BEFORE_FIRST_ROUND" ||
    status === "BEFORE_SECOND_ROUND"
  );
}

export default function ParticipantListRouteScreen() {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const listMode = searchParams.get("list");

  if (listMode === "mvp" || listMode === "second-round") {
    return <ParticipantListScreen />;
  }

  if (
    group?.myRole === "HOST" &&
    shouldUseAdminParticipantManagement(group.status)
  ) {
    return <AdminParticipantManagementScreen />;
  }

  return <ParticipantListScreen />;
}
