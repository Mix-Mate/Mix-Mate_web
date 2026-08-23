type AssignmentRound = 1 | 2;
type PlayActivity = "games" | "small-talk" | "balance";

const groupBase = (groupId: string) => `/groups/${groupId}`;

export const groupRoutes = {
  home: (groupId: string) => `${groupBase(groupId)}/home`,
  completed: (groupId: string) => `${groupBase(groupId)}/completed`,
  participants: (groupId: string) => `${groupBase(groupId)}/participants`,
  profile: (groupId: string) => `${groupBase(groupId)}/profile`,
  profileEdit: (groupId: string) => `${groupBase(groupId)}/profile/edit`,
  team: (groupId: string) => `${groupBase(groupId)}/team`,
  teamMembers: (groupId: string) => `${groupBase(groupId)}/team?tab=members`,
  teamHistory: (groupId: string) => `${groupBase(groupId)}/history`,
  play: (groupId: string) => `${groupBase(groupId)}/play`,
  playActivity: (groupId: string, activity: PlayActivity) =>
    `${groupBase(groupId)}/play/${activity}`,
  mvpVote: (groupId: string) => `${groupBase(groupId)}/votes/mvp`,
  attendanceVote: (groupId: string) => `${groupBase(groupId)}/votes/attendance`,
  voteStatus: (groupId: string) => `${groupBase(groupId)}/votes/status`,
  voteResult: (groupId: string) => `${groupBase(groupId)}/votes/result`,
  voteResultMvpList: (groupId: string) =>
    `${groupBase(groupId)}/participants?list=mvp`,
  voteResultSecondRoundParticipants: (groupId: string) =>
    `${groupBase(groupId)}/participants?list=second-round`,
  adminRecruitment: (groupId: string) =>
    `${groupBase(groupId)}/admin/recruitment`,
  adminParticipants: (groupId: string) =>
    `${groupBase(groupId)}/admin/participants`,
  adminPreparation: (groupId: string) =>
    `${groupBase(groupId)}/admin/preparation`,
  adminProgress: (groupId: string) => `${groupBase(groupId)}/admin/progress`,
  adminVoteEnd: (groupId: string) => `${groupBase(groupId)}/admin/votes/end`,
  adminAssignmentSetup: (groupId: string, round: AssignmentRound) =>
    `${groupBase(groupId)}/admin/assignments/${round}/setup`,
  adminAssignmentFixedMembers: (groupId: string, round: AssignmentRound) =>
    `${groupBase(groupId)}/admin/assignments/${round}/fixed-members`,
  adminAssignmentProcessing: (groupId: string, round: AssignmentRound) =>
    `${groupBase(groupId)}/admin/assignments/${round}/processing`,
  adminAssignmentResult: (groupId: string, round: AssignmentRound) =>
    `${groupBase(groupId)}/admin/assignments/${round}/result`,
  adminRoundTwoPreparation: (groupId: string) =>
    `${groupBase(groupId)}/admin/round-2/preparation`,
  adminRoundTwoParticipants: (groupId: string) =>
    `${groupBase(groupId)}/admin/round-2/participants`,
};
