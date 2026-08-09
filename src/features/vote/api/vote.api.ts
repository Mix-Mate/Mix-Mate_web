import { myTeamMock } from "@/features/team/api/team.mock";
import {
  assertEligibleCandidate,
  assertNotSubmitted,
  assertVoteOpen,
  getEligibleMvpCandidates,
} from "../model/vote.rules";
import {
  attendanceVoteSubmissionSchema,
  mvpVoteSubmissionSchema,
} from "../schemas/vote.schemas";
import type {
  AttendanceVoteContext,
  AttendanceVoteSubmission,
  MvpVoteContext,
  MvpVoteSubmission,
  MvpResultMember,
  VoteProgressContext,
  VoteResultContext,
  VoteStatus,
  VoteStatusMember,
} from "../types/vote.types";

const currentMemberId = "kim-minjun";
const mvpSubmissions = new Map<string, string>();
const attendanceSubmissions = new Map<
  string,
  AttendanceVoteSubmission["choice"]
>();
const voteStatuses = new Map<string, VoteStatus>();

function createVoteStatusMember(
  memberId: string,
  memberName: string,
  attendanceStatus: VoteStatusMember["attendanceStatus"],
  avatarColor = "#9ca3af",
): VoteStatusMember {
  return {
    memberId,
    memberName,
    avatarInitial: memberName.charAt(0),
    avatarColor,
    attendanceStatus,
  };
}

const attendanceMemberMocks: VoteStatusMember[] = [
  createVoteStatusMember("lee-seoyeon", "이서연", "ATTEND"),
  createVoteStatusMember("park-doyun", "박도윤", "ATTEND"),
  createVoteStatusMember("choi-jiwoo", "최지우", "ATTEND"),
  createVoteStatusMember("jeong-seowoo", "정서우", "ATTEND"),
  createVoteStatusMember("kang-hayoon", "강하윤", "ATTEND"),
  createVoteStatusMember("jo-yejun", "조예준", "ATTEND"),
  createVoteStatusMember("yoon-seohyun", "윤서현", "ATTEND"),
];

const absenceMemberMocks: VoteStatusMember[] = [
  createVoteStatusMember("lim-juwon", "임주원", "ABSENT"),
  createVoteStatusMember("shin-taeyang", "신태양", "ABSENT"),
];

const pendingMemberMocks: VoteStatusMember[] = [
  createVoteStatusMember("han-sohee", "한소희", "PENDING"),
  createVoteStatusMember("ryu-doyeon", "류도연", "PENDING", "#8f98a3"),
];

function createMvpResultMember(
  memberId: string,
  memberName: string,
  avatarInitial: string,
  avatarColor: string,
  rank: number,
  voteCount: number,
  teamNumber: number,
  gradeLabel: string,
  mbti: string,
): MvpResultMember {
  return {
    memberId,
    memberName,
    avatarInitial,
    avatarColor,
    rank,
    voteCount,
    teamNumber,
    gradeLabel,
    mbti,
  };
}

const mvpResultMocks: MvpResultMember[] = [
  createMvpResultMember(
    "lee-seoyeon",
    "이서연",
    "이",
    "#dbeafe",
    1,
    5,
    1,
    "신입",
    "INFP",
  ),
  createMvpResultMember(
    "han-sohee",
    "한소희",
    "한",
    "#dbeafe",
    2,
    3,
    4,
    "3학년",
    "ISTP",
  ),
  createMvpResultMember(
    "jeong-hyunwoo",
    "정현우",
    "정",
    "#dbeafe",
    2,
    3,
    2,
    "2학년",
    "ENTP",
  ),
  createMvpResultMember(
    "hwang-minjun",
    "황민준",
    "황",
    "#dbeafe",
    4,
    1,
    3,
    "3학년",
    "ISFJ",
  ),
];

function getSubmissionKey(groupId: string, memberId: string) {
  return `${groupId}:${memberId}`;
}

export function getVoteStatus(groupId: string): VoteStatus {
  return voteStatuses.get(groupId) ?? "OPEN";
}

export function getMvpVoteContext(groupId: string): MvpVoteContext {
  const submissionKey = getSubmissionKey(groupId, currentMemberId);
  const selectedCandidateId = mvpSubmissions.get(submissionKey) ?? null;

  return {
    status: getVoteStatus(groupId),
    currentMemberId,
    candidates: getEligibleMvpCandidates(myTeamMock.members, currentMemberId),
    selectedCandidateId,
    hasSubmitted: selectedCandidateId !== null,
  };
}

export function submitMvpVote(input: MvpVoteSubmission) {
  const submission = mvpVoteSubmissionSchema.parse(input);
  const context = getMvpVoteContext(submission.groupId);

  assertVoteOpen(context.status);
  assertNotSubmitted(context.hasSubmitted);
  assertEligibleCandidate(
    myTeamMock.members,
    submission.voterId,
    submission.candidateId,
  );

  mvpSubmissions.set(
    getSubmissionKey(submission.groupId, submission.voterId),
    submission.candidateId,
  );
}

export function getAttendanceVoteContext(
  groupId: string,
): AttendanceVoteContext {
  const submissionKey = getSubmissionKey(groupId, currentMemberId);
  const selectedChoice = attendanceSubmissions.get(submissionKey) ?? null;

  return {
    status: getVoteStatus(groupId),
    selectedChoice,
    hasSubmitted: selectedChoice !== null,
  };
}

export function submitAttendanceVote(input: AttendanceVoteSubmission) {
  const submission = attendanceVoteSubmissionSchema.parse(input);
  const context = getAttendanceVoteContext(submission.groupId);

  assertVoteOpen(context.status);
  assertNotSubmitted(context.hasSubmitted);

  attendanceSubmissions.set(
    getSubmissionKey(submission.groupId, submission.memberId),
    submission.choice,
  );
}

export function getVoteProgressContext(groupId: string): VoteProgressContext {
  const status = getVoteStatus(groupId);
  const submissionKey = getSubmissionKey(groupId, currentMemberId);
  const hasCompleted =
    mvpSubmissions.has(submissionKey) &&
    attendanceSubmissions.has(submissionKey);
  const currentAttendance = attendanceSubmissions.get(submissionKey);
  const currentMember = myTeamMock.members.find(
    (member) => member.id === currentMemberId,
  );
  const attendanceMembers = [...attendanceMemberMocks];
  const absenceMembers = [...absenceMemberMocks];
  const pendingMembers = [...pendingMemberMocks];

  if (currentMember) {
    const currentStatusMember: VoteStatusMember = {
      memberId: currentMember.id,
      memberName: currentMember.name,
      avatarInitial: currentMember.avatarInitial,
      avatarColor: currentMember.avatarColor,
      attendanceStatus: hasCompleted
        ? (currentAttendance ?? "PENDING")
        : "PENDING",
    };

    if (hasCompleted && currentAttendance === "ATTEND") {
      attendanceMembers.unshift(currentStatusMember);
    } else if (hasCompleted && currentAttendance === "ABSENT") {
      absenceMembers.unshift(currentStatusMember);
    } else {
      pendingMembers.unshift(currentStatusMember);
    }
  }

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

export function getVoteResultContext(groupId: string): VoteResultContext {
  const progress = getVoteProgressContext(groupId);

  return {
    status: "CLOSED",
    teamNumber: myTeamMock.teamNumber,
    teamMvp: mvpResultMocks[0],
    overallRanking: mvpResultMocks,
    attendanceCount: Math.max(8, progress.attendanceCount),
    totalCount: progress.totalCount,
  };
}

export function setMockVoteStatus(groupId: string, status: VoteStatus) {
  voteStatuses.set(groupId, status);
}

export async function endGroupVote(groupId: string) {
  await new Promise((resolve) => setTimeout(resolve, 450));
  setMockVoteStatus(groupId, "CLOSED");

  return getVoteProgressContext(groupId);
}
