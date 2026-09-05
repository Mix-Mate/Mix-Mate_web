import type {
  AssignmentRound,
  AssignmentTeam,
  TeamMemberDetail,
} from "@/features/assignment/types/assignment.types";
import { toBackendRound } from "@/features/assignment/model/assignment.mapper";
import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import {
  getProfileGradeLabel,
  normalizeProfileMbti,
} from "@/shared/lib/profile-labels";
import {
  findAdminParticipantDraft,
  type AdminParticipantDraft,
} from "../model/admin-participant-draft-storage";
import type {
  Participant,
  ParticipantGroup,
  ParticipantListResponse,
  ParticipantProfile,
  ParticipantProfileResponse,
  ParticipantSummaryResponse,
  ParticipantTeam,
} from "../types/participant.types";

type ParticipantProfileResponsePayload =
  | ParticipantProfileResponse
  | {
      data?: ParticipantProfileResponse;
      participant?: ParticipantProfileResponse;
      participantProfile?: ParticipantProfileResponse;
      profile?: ParticipantProfileResponse;
    };

type HydrateParticipantsOptions = {
  detailRole?: "admin";
  hydrateAll?: boolean;
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function toVisibility(
  visibility?: ParticipantSummaryResponse["visibility"] | null,
): Participant["visibility"] {
  return visibility === "PRIVATE" ? "private" : "public";
}

function toGender(
  gender: ParticipantSummaryResponse["gender"],
): Participant["gender"] {
  return gender === "FEMALE" ? "female" : "male";
}

function toRole(position?: ParticipantSummaryResponse["position"]) {
  return position === "STAFF" ? "staff" : "general";
}

function toParticipant(
  summary: ParticipantSummaryResponse,
  draft?: AdminParticipantDraft,
): Participant {
  const grade = summary.grade ?? draft?.grade;
  const position = summary.position ?? draft?.position;
  const isNew = summary.isNew ?? draft?.isNew;
  const mbti = normalizeProfileMbti(summary.mbti ?? draft?.mbti);
  const age = summary.age ?? draft?.age ?? undefined;
  const instagramId = summary.instaId ?? draft?.instaId ?? undefined;
  const bio = summary.bio ?? draft?.bio ?? undefined;

  return {
    id: String(summary.participantId),
    name: summary.displayName,
    department: summary.major || draft?.major || "",
    visibility: toVisibility(summary.visibility),
    role: toRole(position),
    gender: toGender(summary.gender),
    grade: getProfileGradeLabel(grade),
    isNew,
    mbti,
    age,
    instagramId,
    bio,
    manualEntry: summary.manualEntry ?? Boolean(draft),
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
  fallbackVisibility: Participant["visibility"] = "public",
): ParticipantProfile {
  return {
    id: participantId,
    name: profile.displayName,
    department: profile.major,
    visibility: profile.visibility
      ? toVisibility(profile.visibility)
      : fallbackVisibility,
    role: profile.position === "STAFF" ? "staff" : "general",
    gender: profile.gender === "FEMALE" ? "female" : "male",
    grade: getProfileGradeLabel(profile.grade) ?? "",
    mbti: normalizeProfileMbti(profile.mbti) ?? "",
    age: profile.age ?? undefined,
    instagramId: profile.instaId ?? undefined,
    bio: profile.bio ?? undefined,
    isNew: profile.isNew,
  };
}

async function request(path: string, init?: RequestInit) {
  return apiFetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
}

function getParticipantProfilePath(
  groupId: string,
  participantId: string,
  detailRole?: HydrateParticipantsOptions["detailRole"],
) {
  const searchParams = detailRole ? `?role=${detailRole}` : "";
  return `/api/v1/groups/${groupId}/participants/${participantId}${searchParams}`;
}

function unwrapParticipantProfileResponse(
  payload: ParticipantProfileResponsePayload,
): ParticipantProfileResponse {
  if ("data" in payload && payload.data) return payload.data;
  if ("profile" in payload && payload.profile) return payload.profile;
  if ("participantProfile" in payload && payload.participantProfile) {
    return payload.participantProfile;
  }
  if ("participant" in payload && payload.participant) return payload.participant;

  return payload as ParticipantProfileResponse;
}

function isManualParticipant(
  summary: ParticipantSummaryResponse,
  participant: Participant,
) {
  return (
    summary.manualEntry === true ||
    summary.userId === null ||
    participant.manualEntry === true
  );
}

function shouldHydrateParticipant(
  summary: ParticipantSummaryResponse,
  participant: Participant,
  options: HydrateParticipantsOptions,
) {
  if (isManualParticipant(summary, participant)) {
    return false;
  }

  if (!options.detailRole && participant.visibility === "private") {
    return false;
  }

  if (options.hydrateAll) {
    return true;
  }

  return (
    !summary.grade ||
    !summary.position ||
    summary.isNew === undefined ||
    !normalizeProfileMbti(summary.mbti)
  );
}

function mergeHydratedParticipant<TParticipant extends Participant>(
  participant: TParticipant,
  profile: ParticipantProfile,
): TParticipant {
  return {
    ...participant,
    ...profile,
    name: profile.name || participant.name,
    department: profile.department || participant.department,
    role:
      profile.role === "staff" || participant.role === "staff"
        ? "staff"
        : "general",
    grade: profile.grade || participant.grade,
    mbti: profile.mbti || participant.mbti,
    age: profile.age ?? participant.age,
    instagramId: profile.instagramId ?? participant.instagramId,
    bio: profile.bio ?? participant.bio,
    isNew: profile.isNew ?? participant.isNew,
  };
}

export async function hydrateParticipantsWithProfiles<
  TParticipant extends Participant,
>(
  groupId: string,
  participants: TParticipant[],
  summaries: ParticipantSummaryResponse[],
  signal?: AbortSignal,
  options: HydrateParticipantsOptions = {},
): Promise<TParticipant[]> {
  const summaryById = new Map(
    summaries.map((summary) => [String(summary.participantId), summary]),
  );
  const targets = participants.filter((participant) => {
    const summary = summaryById.get(participant.id);
    return summary ? shouldHydrateParticipant(summary, participant, options) : false;
  });

  if (targets.length === 0) {
    return participants;
  }

  const hydratedProfiles = await Promise.all(
    targets.map(async (participant) => {
      try {
        const response = await request(
          getParticipantProfilePath(
            groupId,
            participant.id,
            options.detailRole,
          ),
          { signal },
        );

        if (!response.ok) {
          return null;
        }

        const data = unwrapParticipantProfileResponse(
          (await response.json()) as ParticipantProfileResponsePayload,
        );
        return toParticipantProfile(data, participant.id, participant.visibility);
      } catch (error) {
        if (isAbortError(error)) throw error;
        return null;
      }
    }),
  );
  const profileById = new Map(
    hydratedProfiles
      .filter((profile): profile is ParticipantProfile => profile !== null)
      .map((profile) => [profile.id, profile]),
  );

  return participants.map((participant) => {
    const profile = profileById.get(participant.id);

    return profile ? mergeHydratedParticipant(participant, profile) : participant;
  });
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
  options: {
    detailRole?: "admin";
    hydrateProfiles?: boolean;
    signal?: AbortSignal;
    includeTeams?: boolean;
  } = {},
): Promise<ParticipantGroup> {
  const {
    detailRole,
    hydrateProfiles = true,
    signal,
    includeTeams = true,
  } = options;
  const searchParams = new URLSearchParams({
    round: toBackendRound(round),
  });

  if (detailRole) {
    searchParams.set("role", detailRole);
  }

  const participantsResponse = await request(
    `/api/v1/groups/${groupId}/participants?${searchParams}`,
    { signal },
  );

  if (!participantsResponse.ok) {
    throw await createRequestError(
      participantsResponse,
      "참가자 목록을 불러오지 못했습니다.",
    );
  }

  const data = (await participantsResponse.json()) as ParticipantListResponse;
  const canUseAdminDrafts = detailRole === "admin";
  const mappedParticipants = data.participantList.map((summary) =>
    toParticipant(
      summary,
      canUseAdminDrafts ? findAdminParticipantDraft(groupId, summary) : undefined,
    ),
  );
  const participants = hydrateProfiles
    ? await hydrateParticipantsWithProfiles(
        groupId,
        mappedParticipants,
        data.participantList,
        signal,
        { detailRole },
      )
    : mappedParticipants;
  const participantsById = new Map(
    participants.map((participant) => [participant.id, participant]),
  );
  const teams = includeTeams
    ? await getParticipantTeams(groupId, round, participantsById, signal)
    : [];

  return {
    participants,
    teams,
  };
}

export async function getParticipantProfile(
  groupId: string,
  participantId: string,
  signal?: AbortSignal,
  options: { detailRole?: "admin" } = {},
) {
  const response = await request(
    getParticipantProfilePath(groupId, participantId, options.detailRole),
    {
      signal,
    },
  );

  if (!response.ok) {
    throw await createRequestError(
      response,
      "참가자 프로필을 불러오지 못했습니다.",
    );
  }

  const data = unwrapParticipantProfileResponse(
    (await response.json()) as ParticipantProfileResponsePayload,
  );
  return toParticipantProfile(data, participantId);
}
