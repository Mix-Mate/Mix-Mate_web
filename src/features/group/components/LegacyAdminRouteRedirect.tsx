"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";

type LegacyAdminRouteTarget =
  | "home"
  | "recruitment"
  | "preparation"
  | "progress"
  | "participants"
  | "participant-new"
  | "participant-statistics"
  | "blacklist"
  | "vote-end"
  | "assignment-setup"
  | "assignment-fixed-members"
  | "assignment-processing"
  | "assignment-result";

interface LegacyAdminRouteRedirectProps {
  target: LegacyAdminRouteTarget;
}

function buildTargetHref(target: LegacyAdminRouteTarget, groupId: string) {
  switch (target) {
    case "home":
      return groupRoutes.home(groupId);
    case "recruitment":
      return groupRoutes.adminRecruitment(groupId);
    case "preparation":
      return groupRoutes.adminPreparation(groupId);
    case "progress":
      return groupRoutes.adminProgress(groupId);
    case "participants":
      return groupRoutes.adminParticipants(groupId);
    case "participant-new":
      return groupRoutes.adminParticipantNew(groupId, 1);
    case "participant-statistics":
      return groupRoutes.adminParticipantStatistics(groupId);
    case "blacklist":
      return groupRoutes.blacklist(groupId);
    case "vote-end":
      return groupRoutes.adminVoteEnd(groupId);
    case "assignment-setup":
      return groupRoutes.adminAssignmentSetup(groupId, 1);
    case "assignment-fixed-members":
      return groupRoutes.adminAssignmentFixedMembers(groupId, 1);
    case "assignment-processing":
      return groupRoutes.adminAssignmentProcessing(groupId, 1);
    case "assignment-result":
      return groupRoutes.adminAssignmentResult(groupId, 1);
  }
}

export default function LegacyAdminRouteRedirect({
  target,
}: LegacyAdminRouteRedirectProps) {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("role");
    nextSearchParams.delete("round");
    nextSearchParams.delete("scenario");

    const nextQuery = nextSearchParams.toString();
    router.replace(
      `${buildTargetHref(target, params.groupId)}${nextQuery ? `?${nextQuery}` : ""}`,
      { scroll: false },
    );
  }, [params.groupId, router, searchParams, target]);

  return null;
}
