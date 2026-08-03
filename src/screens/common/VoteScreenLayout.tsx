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
}

export default function VoteScreenLayout({
  children,
  title,
  status,
  backHref,
  testId,
}: VoteScreenLayoutProps) {
  const router = useRouter();

  return (
    <main className={styles.viewport}>
      <section className={styles.phone} data-testid={testId}>
        <Header
          title={title}
          roleLabel={status === "OPEN" ? "투표 진행 중" : "투표 마감"}
          badgeTone="status"
          onBack={() => router.push(backHref)}
        />
        <div className={styles.content}>{children}</div>
      </section>
    </main>
  );
}
