"use client";

import { ChevronLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import styles from "./MyTeamScreen.module.css";

export default function MyTeamScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
  );

  const tabs = [
    { label: "내 조", href: `/groups/${params.groupId}/team`, active: true },
    {
      label: "멤버",
      href: `/groups/${params.groupId}/participants`,
      active: false,
    },
    {
      label: "함께 즐기기",
      href: `/groups/${params.groupId}/play`,
      active: false,
    },
  ];

  return (
    <main className={styles.viewport}>
      <section
        className={styles.phone}
        data-testid="my-team-screen"
        data-scenario={snapshot.scenario}
      >
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.push(`/groups/${params.groupId}/home`)}
            aria-label="사용자 홈으로 이동"
          >
            <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.7} />
          </button>
          <h1>{snapshot.groupName}</h1>
          <span className={styles.roleBadge}>{snapshot.roleLabel}</span>
        </header>

        <nav className={styles.tabs} aria-label="그룹 메뉴">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={tab.active ? styles.activeTab : styles.tab}
              aria-current={tab.active ? "page" : undefined}
              onClick={() => router.push(tab.href)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          <section
            className={styles.assignmentOrb}
            aria-label={
              snapshot.teamNumber === null
                ? "아직 조가 배정되지 않았습니다"
                : `${snapshot.teamNumber}조에 배정되었습니다`
            }
          >
            <span>나 몇 조?</span>
            <strong>
              {snapshot.teamNumber === null
                ? "배정 전"
                : `${snapshot.teamNumber}조`}
            </strong>
          </section>

          <p
            className={styles.statusText}
            aria-label={`현재 진행 상태: ${snapshot.statusLabel}`}
          >
            진행 상태 · {snapshot.statusLabel}
          </p>
        </div>
      </section>
    </main>
  );
}
