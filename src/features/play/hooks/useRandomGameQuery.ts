"use client";

import { useState } from "react";
import { getGameByIndex } from "../data/recommendations";

export function useRandomGameQuery() {
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  return {
    data: getGameByIndex(recommendationIndex),
    isLoading: false,
    isError: false,
    refetch: () => setRecommendationIndex((index) => index + 1),
  };
}
