"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import AdminParticipantManagementScreen from "@/screens/admin/AdminParticipantManagementScreen";
import ParticipantListScreen from "./ParticipantListScreen";

export default function ParticipantListRouteScreen() {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const listMode = searchParams.get("list");

  if (listMode === "mvp" || listMode === "second-round") {
    return <ParticipantListScreen />;
  }

  if (group?.myRole === "HOST") {
    return <AdminParticipantManagementScreen />;
  }

  return <ParticipantListScreen />;
}
