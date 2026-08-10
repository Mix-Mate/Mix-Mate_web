"use client";

import type { ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import {
  getMockGroupRole,
  withSessionContext,
} from "@/features/session/utils/session-navigation";
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
  const searchParams = useSearchParams();
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
    getMockGroupRole(searchParams),
  );

  return (
    <MobileFrame
      className={styles.phone}
      data-testid={testId}
      data-scenario={snapshot.scenario}
      data-role={snapshot.role}
    >
      <Header
        title={snapshot.groupName}
        onBack={() => router.push(withSessionContext(backHref, searchParams))}
      />

      <TeamSectionTabs
        groupId={params.groupId}
        activeSection="play"
        onNavigate={(href) =>
          router.push(withSessionContext(href, searchParams))
        }
      />

      <div className={styles.content}>{children}</div>
    </MobileFrame>
  );
}
