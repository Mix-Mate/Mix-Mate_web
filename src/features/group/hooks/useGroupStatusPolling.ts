"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import type { GroupStatus } from "../types/group.types";
import { useAdminGroupQuery } from "./useAdminGroupQuery";

const GROUP_STATUS_POLLING_INTERVAL_MS = 2_000;

export function useGroupStatusPolling(groupId: string) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: group, refetch } = useAdminGroupQuery(groupId);
  const groupStatus = group?.status;
  const hasGroup = group !== null;
  const mvpVotePath = groupRoutes.mvpVote(groupId);
  const groupPath = `/groups/${groupId}`;
  const isVoteFlowPage =
    pathname.startsWith(`${groupPath}/votes/`) ||
    pathname.startsWith(`${groupPath}/admin/votes/`);
  const isExtraPage =
    pathname?.includes("/extra") || pathname?.endsWith("/extra");
  const isInvalidGroupId =
    !groupId || groupId === "new" || isNaN(Number(groupId));
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (isVoteFlowPage || isExtraPage || isInvalidGroupId) {
      hasNavigatedRef.current = false;
      return;
    }

    if (groupStatus !== "VOTING") {
      hasNavigatedRef.current = false;
    }

    let isActive = true;
    let isRequestPending = false;

    const navigateIfVoting = (status: GroupStatus | undefined) => {
      if (
        status !== "VOTING" ||
        !isActive ||
        hasNavigatedRef.current
      ) {
        return false;
      }

      hasNavigatedRef.current = true;
      router.replace(mvpVotePath);
      return true;
    };

    const pollGroupStatus = async () => {
      if (isRequestPending || hasNavigatedRef.current) return;

      isRequestPending = true;

      try {
        const latestGroup = await refetch();

        if (!latestGroup) {
          if (isActive) {
            console.error("그룹 상태 polling에 실패했습니다.");
          }
          return;
        }

        navigateIfVoting(latestGroup.status);
      } catch (error) {
        if (isActive) {
          console.error("그룹 상태 polling에 실패했습니다.", error);
        }
      } finally {
        isRequestPending = false;
      }
    };

    if (navigateIfVoting(groupStatus)) return;
    if (!hasGroup) void pollGroupStatus();

    const intervalId = window.setInterval(
      () => void pollGroupStatus(),
      GROUP_STATUS_POLLING_INTERVAL_MS,
    );

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [
    groupStatus,
    hasGroup,
    isExtraPage,
    isInvalidGroupId,
    isVoteFlowPage,
    mvpVotePath,
    refetch,
    router,
  ]);
}
