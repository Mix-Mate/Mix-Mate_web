type AssignmentRound = 1 | 2;
type PlayActivity = "games" | "small-talk" | "balance";

const groupBase = (groupId: string) => `/groups/${groupId}`;

export const authRoutes = {
  login: () => "/login",
  signup: () => "/signup",
  findPassword: () => "/find-password",
};

export const groupRoutes = {
  create: () => `/groups/create`,
  createExtra: () => `/groups/create/extra`,
  join: () => `/groups/join`,
  extra: (groupId: string) => `${groupBase(groupId)}/extra`,
  home: (groupId: string) => `${groupBase(groupId)}`,
  adminHome: (groupId: string) => `${groupBase(groupId)}/admin`,
  userHome: (groupId: string) => `${groupBase(groupId)}`,
  completed: (groupId: string) => `${groupBase(groupId)}/completed`,
  participants: (groupId: string) => `${groupBase(groupId)}/participants`,
  blacklist: (groupId: string) => `${groupBase(groupId)}/blacklist`,
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
  adminParticipants: (groupId: string, round?: AssignmentRound) =>
    `${groupBase(groupId)}/admin/participants${round ? `?round=${round}` : ""}`,
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
};
