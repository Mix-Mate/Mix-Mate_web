"use client";

import { useState } from "react";
import { getRandomGame } from "../api/play.api";

export function useRandomGameQuery() {
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  return {
    data: getRandomGame(recommendationIndex),
    isLoading: false,
    isError: false,
    refetch: () => setRecommendationIndex((index) => index + 1),
  };
}
