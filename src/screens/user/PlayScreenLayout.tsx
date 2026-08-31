"use client";

import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import TeamSectionTabs from "@/features/team/components/TeamSectionTabs";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./PlayScreen.module.css";

interface PlayScreenLayoutProps {
  children: ReactNode;
  backHref: string;
  testId: string;
}

export default function PlayScreenLayout({
  children,
  backHref,
  testId,
}: PlayScreenLayoutProps) {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const { data: group } = useAdminGroupQuery(params.groupId);

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.phone}
      fillHeight
      data-testid={testId}
      data-status={group.status}
      data-role={group.myRole === "HOST" ? "ADMIN" : "USER"}
    >
      <Header
        title={group.groupName}
        onBack={() => router.push(backHref)}
      />

      <TeamSectionTabs
        groupId={params.groupId}
        activeSection="play"
        onNavigate={(href) => router.push(href)}
      />

      <div className={styles.content}>{children}</div>
    </MobileFrame>
  );
}
