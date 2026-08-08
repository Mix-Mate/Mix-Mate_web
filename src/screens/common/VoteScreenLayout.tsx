"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import type { VoteStatus } from "@/features/vote/types/vote.types";
import Header from "@/shared/ui/Header";
import styles from "./VoteScreen.module.css";

interface VoteScreenLayoutProps {
  children: ReactNode;
  title: string;
  status: VoteStatus;
  backHref: string;
  testId: string;
  showStatusBadge?: boolean;
  flushContent?: boolean;
}

export default function VoteScreenLayout({
  children,
  title,
  status,
  backHref,
  testId,
  showStatusBadge = true,
  flushContent = false,
}: VoteScreenLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <main className={styles.viewport}>
      <section className={styles.phone} data-testid={testId}>
        <Header
          title={title}
          roleLabel={
            showStatusBadge
              ? status === "OPEN"
                ? "투표 진행 중"
                : "투표 마감"
              : undefined
          }
          badgeTone="status"
          onBack={() =>
            router.push(withSessionContext(backHref, searchParams))
          }
        />
        <div
          className={`${styles.content} ${
            flushContent ? styles.flushContent : ""
          }`}
        >
          {children}
        </div>
      </section>
    </main>
  );
}
