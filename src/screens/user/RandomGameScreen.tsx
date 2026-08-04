"use client";

import { Shuffle } from "lucide-react";
import { useParams } from "next/navigation";
import GameRecommendationCard from "@/features/play/components/GameRecommendationCard";
import styles from "@/features/play/components/play.module.css";
import { useRandomGameQuery } from "@/features/play/hooks/useRandomGameQuery";
import Button from "@/shared/ui/Button";
import PlayScreenLayout from "./PlayScreenLayout";

export default function RandomGameScreen() {
  const params = useParams<{ groupId: string }>();
  const { data: game, refetch } = useRandomGameQuery();

  return (
    <PlayScreenLayout
      backHref={`/groups/${params.groupId}/play`}
      testId="random-game-screen"
    >
      <section className={styles.recommendationScreen}>
        <header className={styles.featureCard}>
          <span className={styles.featureIcon}>
            <Shuffle aria-hidden="true" size={26} strokeWidth={1.7} />
          </span>
          <span className={styles.featureText}>
            <strong>랜덤 술게임</strong>
            <span>
              랜덤으로 술게임을 골라드려요.
              <br />
              친구들과 함께 추억을 쌓아봐요.
            </span>
          </span>
        </header>

        <div className={styles.gameContentCard}>
          <GameRecommendationCard game={game} />

          <Button className={styles.primaryButton} onClick={refetch}>
            다른 게임 추천받기
          </Button>
        </div>
      </section>
    </PlayScreenLayout>
  );
}
