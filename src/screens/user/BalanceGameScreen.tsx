"use client";

import { Scale } from "lucide-react";
import { useParams } from "next/navigation";
import styles from "@/features/play/components/play.module.css";
import { useRandomTopicQuery } from "@/features/play/hooks/useRandomTopicQuery";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import PlayScreenLayout from "./PlayScreenLayout";

export default function BalanceGameScreen() {
  const params = useParams<{ groupId: string }>();
  const { data: topic, refetch } = useRandomTopicQuery("balance");
  const choices = topic.choices ?? ["선택지 A", "선택지 B"];

  return (
    <PlayScreenLayout
      backHref={groupRoutes.play(params.groupId)}
      testId="balance-game-screen"
    >
      <section className={styles.balanceScreen}>
        <header className={styles.featureCard}>
          <span className={styles.featureIcon}>
            <Scale aria-hidden="true" size={26} strokeWidth={1.7} />
          </span>
          <span className={styles.featureText}>
            <strong>밸런스 게임</strong>
            <span>
              둘 중 하나를 선택해야 한다면?
              <br />
              친구들의 선택과 비교해봐요.
            </span>
          </span>
        </header>

        <div className={styles.balanceContentCard}>
          <div className={styles.balanceScrollArea}>
            <article className={styles.balanceQuestion} aria-live="polite">
              <div className={styles.balancePromptSlot}>
                <h2 className={styles.balancePrompt}>{topic.prompt}</h2>
              </div>

              <div className={styles.balanceChoices}>
                <div className={styles.choiceCard}>
                  <span>{choices[0]}</span>
                </div>

                <span className={styles.versusBadge} aria-hidden="true">
                  VS
                </span>

                <div className={styles.choiceCard}>
                  <span>{choices[1]}</span>
                </div>
              </div>
            </article>
          </div>

          <Button className={styles.primaryButton} onClick={refetch}>
            다른 주제 추천받기
          </Button>
        </div>
      </section>
    </PlayScreenLayout>
  );
}
