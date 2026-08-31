"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import type { VoteStatus } from "@/features/vote/types/vote.types";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./VoteScreen.module.css";

interface VoteScreenLayoutProps {
  children: ReactNode;
  title: string;
  status: VoteStatus;
  backHref?: string;
  onBack?: () => void;
  testId: string;
  showStatusBadge?: boolean;
  flushContent?: boolean;
}

export default function VoteScreenLayout({
  children,
  title,
  status,
  backHref,
  onBack,
  testId,
  showStatusBadge = true,
  flushContent = false,
}: VoteScreenLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <MobileFrame className={styles.phone} data-testid={testId}>
      <Header
        title={title}
        statusLabel={
          showStatusBadge
            ? status === "OPEN"
              ? "투표 진행 중"
              : "투표 마감"
            : undefined
        }
        onBack={
          onBack ??
          (backHref
            ? () => router.push(withSessionContext(backHref, searchParams))
            : undefined)
        }
      />
      <div
        className={`${styles.content} ${
          flushContent ? styles.flushContent : ""
        }`}
      >
        {children}
      </div>
    </MobileFrame>
  );
}
