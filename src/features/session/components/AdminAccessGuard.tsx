"use client";

import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import AdminAccessDeniedScreen from "@/screens/common/AdminAccessDeniedScreen";
import { groupRoutes } from "@/shared/lib/navigation/routes";

interface AdminAccessGuardProps {
  children: ReactNode;
}

export default function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const { data: group } = useAdminGroupQuery(params.groupId);

  if (!group) return null;

  if (group.myRole === "HOST") return children;

  return (
    <AdminAccessDeniedScreen
      onBack={() => router.back()}
      onGoHome={() => router.replace(groupRoutes.home(params.groupId))}
    />
  );
}
