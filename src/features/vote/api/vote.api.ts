import type {
  VoteProgressContext,
  VoteStatus,
  VoteStatusMember,
} from "../types/vote.types";

const currentMemberId = "kim-minjun";
const voteStatuses = new Map<string, VoteStatus>();

function createVoteStatusMember(
  memberId: string,
  memberName: string,
  attendanceStatus: VoteStatusMember["attendanceStatus"],
  gender: VoteStatusMember["gender"],
): VoteStatusMember {
  return {
    memberId,
    memberName,
    gender,
    attendanceStatus,
  };
}

const attendanceMemberMocks: VoteStatusMember[] = [
  createVoteStatusMember("lee-seoyeon", "이서연", "ATTEND", "female"),
  createVoteStatusMember("park-doyun", "박도윤", "ATTEND", "male"),
  createVoteStatusMember("choi-jiwoo", "최지우", "ATTEND", "female"),
  createVoteStatusMember("jeong-seowoo", "정서우", "ATTEND", "male"),
  createVoteStatusMember("kang-hayoon", "강하윤", "ATTEND", "female"),
  createVoteStatusMember("jo-yejun", "조예준", "ATTEND", "male"),
  createVoteStatusMember("yoon-seohyun", "윤서현", "ATTEND", "female"),
];

const absenceMemberMocks: VoteStatusMember[] = [
  createVoteStatusMember("lim-juwon", "임주원", "ABSENT", "female"),
  createVoteStatusMember("shin-taeyang", "신태양", "ABSENT", "male"),
];

const pendingMemberMocks: VoteStatusMember[] = [
  createVoteStatusMember("han-sohee", "한소희", "PENDING", "female"),
  createVoteStatusMember("ryu-dohyeon", "류도현", "PENDING", "male"),
];

export function getVoteStatus(groupId: string): VoteStatus {
  return voteStatuses.get(groupId) ?? "OPEN";
}

export function getVoteProgressContext(groupId: string): VoteProgressContext {
  const status = getVoteStatus(groupId);
  const attendanceMembers = [...attendanceMemberMocks];
  const absenceMembers = [...absenceMemberMocks];
  const pendingMembers = [...pendingMemberMocks];

  if (status === "CLOSED") {
    absenceMembers.push(
      ...pendingMembers.splice(0).map((member) => ({
        ...member,
        attendanceStatus: "ABSENT" as const,
      })),
    );
  }

  const attendanceCount = attendanceMembers.length;
  const absenceCount = absenceMembers.length;
  const pendingCount = pendingMembers.length;

  return {
    status,
    currentMemberId,
    totalCount: attendanceCount + absenceCount + pendingCount,
    completedCount: attendanceCount + absenceCount,
    attendanceCount,
    absenceCount,
    pendingCount,
    attendanceMembers,
    absenceMembers,
    pendingMembers,
  };
}
