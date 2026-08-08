"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <main className={styles.viewport}>
      <section className={styles.phone} data-testid={testId}>
        <Header
          title={title}
          statusLabel={
            showStatusBadge
              ? status === "OPEN"
                ? "투표 진행 중"
                : "투표 마감"
              : undefined
          }
          onBack={() => router.push(backHref)}
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
