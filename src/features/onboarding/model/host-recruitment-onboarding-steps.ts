import { FIRST_ROUND_MIN_PARTICIPANTS } from "@/features/group/lib/recruitment";

export type HostRecruitmentOnboardingStepId =
  | "status"
  | "inviteCode"
  | "inviteLink"
  | "inviteLinkRenewal"
  | "recruiting"
  | "participantCount"
  | "closeRecruitment";

export interface HostRecruitmentOnboardingStepCopy {
  id: HostRecruitmentOnboardingStepId;
  title: string;
  description: string;
  notes?: readonly string[];
}

export const hostRecruitmentOnboardingSteps: readonly HostRecruitmentOnboardingStepCopy[] =
  [
    {
      id: "status",
      title: "모임의 진행 상태를 확인해요",
      description: "현재 모임이 어느 단계인지 한눈에 확인할 수 있어요.",
    },
    {
      id: "inviteCode",
      title: "참가자를 초대해요",
      description:
        "그룹 코드를 복사해 공유하면 참가자가 모임에 참여할 수 있어요.",
    },
    {
      id: "inviteLink",
      title: "초대 링크로 바로 참여해요",
      description:
        "참가자는 초대 링크만 열면 코드를 입력하지 않고 바로 모임 참여를 시작할 수 있어요.",
    },
    {
      id: "inviteLinkRenewal",
      title: "필요하면 초대를 다시 발급해요",
      description:
        "참여 코드나 링크가 외부에 공유됐거나 유효기간이 지났다면 새 초대를 발급해 다시 공유할 수 있어요.",
    },
    {
      id: "recruiting",
      title: "참가자를 기다려요",
      description:
        "초대한 참가자가 들어오면 이곳에서 모집 현황을 확인할 수 있어요.",
    },
    {
      id: "participantCount",
      title: "참가자를 확인하고 관리해요",
      description:
        "현재 참여 인원을 확인하고, 눌러서 참가자 목록을 확인하거나 참가자를 직접 추가할 수 있어요.",
    },
    {
      id: "closeRecruitment",
      title: "모두 모였다면 모집을 마감해요",
      description:
        "참가자가 모두 모이면 모집을 마감하고 다음 단계로 진행할 수 있어요.",
      notes: [
        `참가자가 ${FIRST_ROUND_MIN_PARTICIPANTS}명 이상 모이면 모집을 마감할 수 있어요.`,
        "HOST는 이후 2차 참여 투표에서 불참을 선택하더라도 모임 진행과 관리 기능을 계속 사용할 수 있어요.",
      ],
    },
  ];
