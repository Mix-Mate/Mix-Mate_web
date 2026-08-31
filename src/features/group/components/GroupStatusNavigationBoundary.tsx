"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useGroupStatusNavigation } from "../hooks/useGroupStatusNavigation";

interface GroupStatusNavigationBoundaryProps {
  children: ReactNode;
}

export default function GroupStatusNavigationBoundary({
  children,
}: GroupStatusNavigationBoundaryProps) {
  const params = useParams<{ groupId: string }>();

  useGroupStatusNavigation(params.groupId);

  return children;
}
