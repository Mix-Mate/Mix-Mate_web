"use client";

import type { ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import TeamSectionTabs from "@/features/team/components/TeamSectionTabs";
import Header from "@/shared/ui/Header";
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
  );

  return (
    <main className={styles.viewport}>
      <section
        className={styles.phone}
        data-testid={testId}
        data-scenario={snapshot.scenario}
      >
        <Header
          title={snapshot.groupName}
          onBack={() => router.push(backHref)}
        />

        <TeamSectionTabs
          groupId={params.groupId}
          activeSection="play"
          onNavigate={(href) => router.push(href)}
        />

        <div className={styles.content}>{children}</div>
      </section>
    </main>
  );
}
