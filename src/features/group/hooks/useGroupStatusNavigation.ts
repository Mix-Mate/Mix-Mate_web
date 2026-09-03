"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { isGroupHomeRoute } from "../lib/group-entry-route";
import type { GroupStatus } from "../types/group.types";
import { useAdminGroupQuery } from "./useAdminGroupQuery";

export function useGroupStatusNavigation(groupId: string) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: group } = useAdminGroupQuery(groupId);
  const lastNavigationRef = useRef<string | null>(null);
  const previousGroupRef = useRef<{
    groupId: string;
    status: GroupStatus;
  } | null>(null);
  const groupPath = `/groups/${groupId}`;
  const isCurrentGroupPage =
    pathname === groupPath || pathname.startsWith(`${groupPath}/`);
  const isVoteFlowPage =
    pathname.startsWith(`${groupPath}/votes/`) ||
    pathname.startsWith(`${groupPath}/admin/votes/`);
  const status = group?.status;

  useEffect(() => {
    const previousGroup = previousGroupRef.current;
    previousGroupRef.current = status ? { groupId, status } : null;
    const didStartVoting =
      previousGroup?.groupId === groupId &&
      previousGroup.status !== "VOTING" &&
      status === "VOTING";
    // 이미 투표 중인 그룹의 홈 진입은 유지하고, 머무는 동안 투표가 시작되면 이동한다.
    const target =
      status === "VOTING" &&
      isCurrentGroupPage &&
      !isVoteFlowPage &&
      !pathname.includes("/extra") &&
      /^[1-9]\d*$/.test(groupId) &&
      (!isGroupHomeRoute(pathname, groupId) || didStartVoting)
        ? groupRoutes.mvpVote(groupId)
        : null;

    if (!target) {
      lastNavigationRef.current = null;
      return;
    }

    const navigation = `${pathname}:${target}`;
    if (lastNavigationRef.current === navigation) return;
    lastNavigationRef.current = navigation;
    router.replace(target);
  }, [groupId, isCurrentGroupPage, isVoteFlowPage, pathname, router, status]);
}
