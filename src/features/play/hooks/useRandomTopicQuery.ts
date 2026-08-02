"use client";

import { useState } from "react";
import { getRandomTopic } from "../api/play.api";
import type { TopicCategoryId } from "../types/play.types";

export function useRandomTopicQuery(category: TopicCategoryId) {
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  return {
    data: getRandomTopic(category, recommendationIndex),
    isLoading: false,
    isError: false,
    refetch: () => setRecommendationIndex((index) => index + 1),
  };
}
