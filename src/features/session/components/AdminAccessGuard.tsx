"use client";

import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import AdminAccessDeniedScreen from "@/screens/common/AdminAccessDeniedScreen";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./admin-access-guard.module.css";

interface AdminAccessGuardProps {
  children: ReactNode;
}

export default function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const {
    data: group,
    isLoading,
    error,
    refetch,
  } = useAdminGroupQuery(params.groupId);

  if (!group) {
    return (
      <MobileFrame
        className={styles.phone}
        data-testid="admin-group-query-state"
      >
        <Header title="그룹 정보" onBack={() => router.back()} compact />

        <main className={styles.content}>
          {isLoading ? (
            <p role="status">그룹 정보를 불러오는 중입니다.</p>
          ) : (
            <>
              <p className={styles.error} role="alert">
                {error ?? "그룹 정보를 불러오지 못했습니다."}
              </p>
              <Button className={styles.retryButton} onClick={refetch}>
                다시 시도
              </Button>
            </>
          )}
        </main>
      </MobileFrame>
    );
  }

  if (group.myRole === "HOST") return children;

  return (
    <AdminAccessDeniedScreen
      onBack={() => router.back()}
      onGoHome={() => router.replace(groupRoutes.home(params.groupId))}
    />
  );
}
