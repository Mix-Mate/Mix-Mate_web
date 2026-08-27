"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useGroupStatusPolling } from "../hooks/useGroupStatusPolling";

interface GroupStatusPollingBoundaryProps {
  children: ReactNode;
}

export default function GroupStatusPollingBoundary({
  children,
}: GroupStatusPollingBoundaryProps) {
  const params = useParams<{ groupId: string }>();

  useGroupStatusPolling(params.groupId);

  return children;
}
