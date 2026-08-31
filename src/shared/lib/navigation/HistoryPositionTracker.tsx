"use client";

import { useEffect } from "react";
import { trackHistoryPositions } from "./history-position";

export default function HistoryPositionTracker() {
  useEffect(() => trackHistoryPositions(), []);
  return null;
}
