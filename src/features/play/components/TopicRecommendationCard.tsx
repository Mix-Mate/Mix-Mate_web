import type { TopicRecommendation } from "../types/play.types";
import styles from "./play.module.css";

interface TopicRecommendationCardProps {
  topic: TopicRecommendation;
}

export default function TopicRecommendationCard({
  topic,
}: TopicRecommendationCardProps) {
  return (
    <article className={styles.topicRecommendation} aria-live="polite">
      <span>추천 주제</span>
      <p>{topic.prompt}</p>
    </article>
  );
}
