import { Mic2 } from "lucide-react";
import type { GameRecommendation } from "../types/play.types";
import styles from "./play.module.css";

interface GameRecommendationCardProps {
  game: GameRecommendation;
}

export default function GameRecommendationCard({
  game,
}: GameRecommendationCardProps) {
  return (
    <article className={styles.gameRecommendation} aria-live="polite">
      <header className={styles.gameTitle}>
        <span className={styles.gameTitleIcon}>
          <Mic2 aria-hidden="true" size={28} strokeWidth={1.7} />
        </span>
        <h2>{game.title}</h2>
      </header>

      <section className={styles.gameSection}>
        <h3>구성</h3>
        <ul className={styles.compositionList}>
          {game.composition.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.gameSection}>
        <h3>진행방법</h3>
        <ol className={styles.stepList}>
          {game.steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
