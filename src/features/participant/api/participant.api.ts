import type {
  AssignmentRound,
  AssignmentTeam,
  TeamMemberDetail,
} from "@/features/assignment/types/assignment.types";
import { toBackendRound } from "@/features/assignment/model/assignment.mapper";
import { getGroupDetail } from "@/features/group/api/group.api";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import type {
  Participant,
  ParticipantGroup,
  ParticipantListResponse,
  ParticipantProfile,
  ParticipantProfileResponse,
  ParticipantSummaryResponse,
  ParticipantTeam,
} from "../types/participant.types";

const gradeLabels: Record<ParticipantProfileResponse["grade"], string> = {
  FIRST: "1학년",
  SECOND: "2학년",
  THIRD: "3학년",
  FOURTH: "4학년",
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function toVisibility(
  visibility: ParticipantSummaryResponse["visibility"],
): Participant["visibility"] {
  return visibility === "PUBLIC" ? "public" : "private";
}

function toGender(
  gender: ParticipantSummaryResponse["gender"],
): Participant["gender"] {
  return gender === "FEMALE" ? "female" : "male";
}

function toParticipant(summary: ParticipantSummaryResponse): Participant {
  return {
    id: String(summary.participantId),
    name: summary.displayName,
    department: summary.major,
    visibility: toVisibility(summary.visibility),
    role: "general",
    gender: toGender(summary.gender),
  };
}

function toTeamMemberParticipant(member: TeamMemberDetail): Participant {
  return {
    id: String(member.participantId),
    name: member.displayName,
    department: member.major,
    visibility: toVisibility(member.visibility),
    role: "general",
    gender: toGender(member.gender),
  };
}

async function createRequestError(response: Response, fallbackMessage: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return new Error(body.message ?? fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

export function toParticipantProfile(
  profile: ParticipantProfileResponse,
  participantId: string,
  visibility: Participant["visibility"] = "public",
): ParticipantProfile {
  return {
    id: participantId,
    name: profile.displayName,
    department: profile.major,
    visibility,
    role: profile.position === "STAFF" ? "staff" : "general",
    gender: profile.gender === "FEMALE" ? "female" : "male",
    grade: gradeLabels[profile.grade],
    mbti: profile.mbti,
    age: profile.age,
    instagramId: profile.instaId,
    bio: profile.bio,
    isNew: profile.isNew,
  };
}

async function request(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: withAuthHeaders({
      Accept: "application/json",
      ...init?.headers,
    }),
  });
}

async function getParticipantWithProfile(
  groupId: string,
  summary: ParticipantSummaryResponse,
  signal?: AbortSignal,
): Promise<Participant> {
  const participantId = String(summary.participantId);

  try {
    const response = await request(
      `/api/v1/groups/${groupId}/participants/${participantId}`,
      { signal },
    );

    if (!response.ok) {
      return toParticipant(summary);
    }

    const profile = (await response.json()) as ParticipantProfileResponse;
    return toParticipantProfile(profile, participantId, toVisibility(summary.visibility));
  } catch (error) {
    if (isAbortError(error)) throw error;
    return toParticipant(summary);
  }
}

async function getParticipantTeams(
  groupId: string,
  round: AssignmentRound,
  participantsById: Map<string, Participant>,
  signal?: AbortSignal,
): Promise<ParticipantTeam[]> {
  try {
    const response = await request(
      `/api/v1/groups/${groupId}/rounds/${toBackendRound(round)}/teams`,
      { signal },
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as { teams: AssignmentTeam[] };

    return data.teams.map((team) => ({
      teamNumber: team.teamNumber,
      members: team.members.map((member) => {
        const participantId = String(member.participantId);
        return participantsById.get(participantId) ?? toTeamMemberParticipant(member);
      }),
    }));
  } catch (error) {
    if (isAbortError(error)) throw error;
    return [];
  }
}

export async function getParticipants(
  groupId: string,
  round: AssignmentRound = 1,
  signal?: AbortSignal,
): Promise<ParticipantGroup> {
  const [groupDetail, participantsResponse] = await Promise.all([
    getGroupDetail(groupId),
    request(`/api/v1/groups/${groupId}/participants?round=${toBackendRound(round)}`, {
      signal,
    }),
  ]);

  if (!participantsResponse.ok) {
    throw await createRequestError(
      participantsResponse,
      "참가자 목록을 불러오지 못했습니다.",
    );
  }

  const data = (await participantsResponse.json()) as ParticipantListResponse;
  const participants = await Promise.all(
    data.participantList.map((summary) =>
      getParticipantWithProfile(groupId, summary, signal),
    ),
  );
  const participantsById = new Map(
    participants.map((participant) => [participant.id, participant]),
  );
  const teams = await getParticipantTeams(
    groupId,
    round,
    participantsById,
    signal,
  );

  return {
    groupName: groupDetail.groupName,
    participants,
    teams,
  };
}

export async function getParticipantProfile(
  groupId: string,
  participantId: string,
  signal?: AbortSignal,
) {
  const response = await request(
    `/api/v1/groups/${groupId}/participants/${participantId}`,
    { signal },
  );

  if (!response.ok) {
    throw await createRequestError(
      response,
      "참가자 프로필을 불러오지 못했습니다.",
    );
  }

  const data = (await response.json()) as ParticipantProfileResponse;
  return toParticipantProfile(data, participantId);
}
