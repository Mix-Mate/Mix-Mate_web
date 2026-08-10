"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useParams } from "next/navigation";
import styles from "@/features/play/components/play.module.css";
import TopicCategoryList from "@/features/play/components/TopicCategoryList";
import TopicRecommendationCard from "@/features/play/components/TopicRecommendationCard";
import { useRandomTopicQuery } from "@/features/play/hooks/useRandomTopicQuery";
import type { TopicCategory } from "@/features/play/types/play.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import PlayScreenLayout from "./PlayScreenLayout";

const categories: TopicCategory[] = [
  { id: "place", label: "장소" },
  { id: "career", label: "취업/공부" },
  { id: "campus", label: "학교생활" },
  { id: "mbti", label: "MBTI" },
  { id: "hobby", label: "취미" },
  { id: "travel", label: "여행" },
  { id: "food", label: "음식" },
  { id: "etc", label: "기타" },
];

export default function SmallTalkScreen() {
  const params = useParams<{ groupId: string }>();
  const [activeCategory, setActiveCategory] =
    useState<TopicCategory["id"]>("place");
  const { data: topic, refetch } = useRandomTopicQuery(activeCategory);

  return (
    <PlayScreenLayout
      backHref={groupRoutes.play(params.groupId)}
      testId="small-talk-screen"
    >
      <section className={styles.topicScreen}>
        <header className={styles.featureCard}>
          <span className={styles.featureIcon}>
            <MessageCircle aria-hidden="true" size={26} strokeWidth={1.7} />
          </span>
          <span className={styles.featureText}>
            <strong>스몰토크 주제 추천</strong>
            <span>
              어색한 분위기를 부드럽게 풀어주는
              <br />
              대화 주제를 추천해 드릴게요.
            </span>
          </span>
        </header>

        <div className={styles.topicContentCard}>
          <TopicCategoryList
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
          <TopicRecommendationCard topic={topic} />

          <Button className={styles.primaryButton} onClick={refetch}>
            다른 주제 추천받기
          </Button>
        </div>
      </section>
    </PlayScreenLayout>
  );
}
