"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import AdminAccessDeniedScreen from "@/screens/common/AdminAccessDeniedScreen";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import {
  getMockGroupRole,
  withSessionContext,
} from "../utils/session-navigation";

interface AdminAccessGuardProps {
  children: ReactNode;
}

export default function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = getMockGroupRole(searchParams) === "ADMIN";

  if (isAdmin) return children;

  const homeHref = withSessionContext(
    groupRoutes.home(params.groupId),
    searchParams,
  );

  return (
    <AdminAccessDeniedScreen
      onBack={() => router.back()}
      onGoHome={() => router.replace(homeHref)}
    />
  );
}
