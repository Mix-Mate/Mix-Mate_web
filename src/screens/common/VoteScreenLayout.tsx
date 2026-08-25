"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import type { VoteStatus } from "@/features/vote/types/vote.types";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./VoteScreen.module.css";

const BACK_GUARD_STATE_KEY = "__mixmateVoteBackGuard";

function hasCurrentBackGuardState(state: unknown, currentUrl: string) {
  return (
    typeof state === "object" &&
    state !== null &&
    BACK_GUARD_STATE_KEY in state &&
    state[BACK_GUARD_STATE_KEY] === currentUrl
  );
}

function createBackGuardState(currentUrl: string) {
  const currentState: unknown = window.history.state;

  return {
    ...(typeof currentState === "object" && currentState !== null
      ? currentState
      : {}),
    [BACK_GUARD_STATE_KEY]: currentUrl,
  };
}

interface VoteScreenLayoutProps {
  children: ReactNode;
  title: string;
  status: VoteStatus;
  backHref?: string;
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

  useEffect(() => {
    if (backHref) return;

    const currentUrl = window.location.href;

    if (!hasCurrentBackGuardState(window.history.state, currentUrl)) {
      window.history.pushState(
        createBackGuardState(currentUrl),
        "",
        currentUrl,
      );
    }

    const preventBackNavigation = (event: PopStateEvent) => {
      if (!hasCurrentBackGuardState(event.state, currentUrl)) {
        window.history.forward();
      }
    };

    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, [backHref]);

  return (
    <MobileFrame className={styles.phone} fillHeight data-testid={testId}>
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
          backHref
            ? () => router.push(withSessionContext(backHref, searchParams))
            : undefined
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
