"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { useAdminGroupQuery } from "./useAdminGroupQuery";

export function useGroupStatusNavigation(groupId: string) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: group } = useAdminGroupQuery(groupId);
  const lastNavigationRef = useRef<string | null>(null);
  const groupPath = `/groups/${groupId}`;
  const isVoteFlowPage =
    pathname.startsWith(`${groupPath}/votes/`) ||
    pathname.startsWith(`${groupPath}/admin/votes/`) ||
    pathname === `${groupPath}/admin/vote-status`;
  const target =
    group?.status === "VOTING" &&
    !isVoteFlowPage &&
    !pathname.includes("/extra") &&
    /^[1-9]\d*$/.test(groupId)
      ? groupRoutes.mvpVote(groupId)
      : null;

  useEffect(() => {
    if (!target) {
      lastNavigationRef.current = null;
      return;
    }

    const navigation = `${pathname}:${target}`;
    if (lastNavigationRef.current === navigation) return;
    lastNavigationRef.current = navigation;
    router.replace(target);
  }, [pathname, router, target]);
}
