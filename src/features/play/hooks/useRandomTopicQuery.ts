"use client";

import { useState } from "react";
import { getTopicByIndex } from "../data/recommendations";
import type { TopicCategoryId } from "../types/play.types";

export function useRandomTopicQuery(category: TopicCategoryId) {
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  return {
    data: getTopicByIndex(category, recommendationIndex),
    isLoading: false,
    isError: false,
    refetch: () => setRecommendationIndex((index) => index + 1),
  };
}
