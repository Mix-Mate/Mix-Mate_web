"use client";

import { useEffect, useState } from "react";
import { getVoteProgressContext } from "../api/vote.api";

export function useVoteStatusQuery(groupId: string) {
  const [data, setData] = useState(() => getVoteProgressContext(groupId));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData(getVoteProgressContext(groupId));
    }, 3000);

    return () => window.clearInterval(timer);
  }, [groupId]);

  return {
    data,
    isComplete: data.completedCount === data.totalCount,
  };
}
