type AssignmentRound = 1 | 2;
type PlayActivity = "games" | "small-talk" | "balance";

const groupBase = (groupId: string) => `/groups/${groupId}`;

export const groupRoutes = {
  home: (groupId: string) => `${groupBase(groupId)}/home`,
  completed: (groupId: string) => `${groupBase(groupId)}/completed`,
  participants: (groupId: string) => `${groupBase(groupId)}/participants`,
  profileEdit: (groupId: string) => `${groupBase(groupId)}/profile/edit`,
  team: (groupId: string) => `${groupBase(groupId)}/team`,
  teamMembers: (groupId: string) => `${groupBase(groupId)}/team?tab=members`,
  teamHistory: (groupId: string) => `${groupBase(groupId)}/team/history`,
  play: (groupId: string) => `${groupBase(groupId)}/play`,
  playActivity: (groupId: string, activity: PlayActivity) =>
    `${groupBase(groupId)}/play/${activity}`,
  mvpVote: (groupId: string) => `${groupBase(groupId)}/votes/mvp`,
  attendanceVote: (groupId: string) => `${groupBase(groupId)}/votes/attendance`,
  voteStatus: (groupId: string) => `${groupBase(groupId)}/votes/status`,
  voteResult: (groupId: string) => `${groupBase(groupId)}/votes/result`,
  adminProgress: (groupId: string) => `${groupBase(groupId)}/admin/progress`,
  adminVoteEnd: (groupId: string) => `${groupBase(groupId)}/admin/votes/end`,
  adminAssignmentSetup: (groupId: string, round: AssignmentRound) =>
    `${groupBase(groupId)}/admin/assignments/${round}/setup`,
  adminRoundTwoPreparation: (groupId: string) =>
    `${groupBase(groupId)}/admin/round-2/preparation`,
  adminRoundTwoParticipants: (groupId: string) =>
    `${groupBase(groupId)}/admin/round-2/participants`,
};
