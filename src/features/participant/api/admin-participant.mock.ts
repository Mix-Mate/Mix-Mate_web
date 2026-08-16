import type {
  AdminParticipant,
  AdminParticipantGroup,
  ParticipantGender,
  ParticipantProfileRequest,
  ParticipantRole,
  ParticipantVisibility,
  ProfileGrade,
  ProfilePosition,
  ProfileVisibility,
} from "../types/participant.types";

const STORAGE_KEY = "mixmate-admin-participants";
const DELETED_STORAGE_KEY = "mixmate-admin-deleted-participants";

export const adminParticipantGroupMock: AdminParticipantGroup = {
  groupName: "2026 SW 동아리 MT",
  participants: [
    {
      id: "1",
      name: "김민준",
      department: "컴퓨터공학과",
      visibility: "public",
      role: "staff",
      gender: "male",
      grade: "3학년",
      isNew: false,
      mbti: "ISTP",
      age: 24,
      instagramId: "@minjun_k",
      bio: "관리자 김민준입니다.",
    },
    {
      id: "2",
      name: "이서연",
      department: "정보통신공학과",
      visibility: "public",
      role: "general",
      gender: "female",
      grade: "1학년",
      isNew: true,
      mbti: "INFP",
      age: 21,
      instagramId: "@lee.seoyeon",
      bio: "안녕하세요! 데이터 좋아하는 1학년입니다 😊",
    },
    {
      id: "3",
      name: "박지호",
      department: "전기공학과",
      visibility: "private",
      role: "general",
      gender: "male",
      grade: "1학년",
      isNew: true,
      mbti: "ISTJ",
      age: 22,
      instagramId: "@park.jiho",
      bio: "전기공학과 박지호입니다.",
    },
    {
      id: "4",
      name: "최수아",
      department: "산업디자인",
      visibility: "public",
      role: "staff",
      gender: "female",
      grade: "4학년",
      isNew: false,
      mbti: "ISFP",
      age: 23,
      instagramId: "@choi.sua",
      bio: "산업디자인 최수아입니다.",
    },
  ],
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJsonArray<TValue>(key: string): TValue[] {
  if (!canUseStorage()) return [];

  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as TValue[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArray<TValue>(key: string, value: TValue[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getDeletedParticipantIds() {
  return new Set(readJsonArray<string>(DELETED_STORAGE_KEY));
}

function toVisibility(visibility: ProfileVisibility): ParticipantVisibility {
  return visibility === "PUBLIC" ? "public" : "private";
}

function toRole(position: ProfilePosition): ParticipantRole {
  return position === "STAFF" ? "staff" : "general";
}

function toGender(gender: "MALE" | "FEMALE"): ParticipantGender {
  return gender === "MALE" ? "male" : "female";
}

function toGradeLabel(grade: ProfileGrade) {
  const gradeLabelMap: Record<ProfileGrade, string> = {
    FIRST: "1학년",
    SECOND: "2학년",
    THIRD: "3학년",
    FOURTH: "4학년",
  };

  return gradeLabelMap[grade];
}

export function createAdminParticipantFromRequest(
  input: ParticipantProfileRequest,
): AdminParticipant {
  return {
    id: `local-${Date.now()}`,
    name: input.displayName,
    department: input.major,
    visibility: toVisibility(input.visibility),
    role: toRole(input.position),
    gender: toGender(input.gender),
    grade: toGradeLabel(input.grade),
    isNew: input.isNew,
    mbti: input.mbti,
    age: input.age ?? undefined,
    instagramId: input.instaId ?? undefined,
    bio: input.bio ?? undefined,
  };
}

export function getAdminParticipantListMock() {
  const addedParticipants = readJsonArray<AdminParticipant>(STORAGE_KEY);
  const deletedParticipantIds = getDeletedParticipantIds();

  return {
    ...adminParticipantGroupMock,
    participants: [...adminParticipantGroupMock.participants, ...addedParticipants].filter(
      (participant) => !deletedParticipantIds.has(participant.id),
    ),
  };
}

export function addAdminParticipantMock(input: ParticipantProfileRequest) {
  const participant = createAdminParticipantFromRequest(input);
  const currentParticipants = readJsonArray<AdminParticipant>(STORAGE_KEY);
  writeJsonArray(STORAGE_KEY, [...currentParticipants, participant]);
  return participant;
}

export function deleteAdminParticipantMock(participantId: string) {
  const currentParticipants = readJsonArray<AdminParticipant>(STORAGE_KEY);
  const remainingParticipants = currentParticipants.filter(
    (participant) => participant.id !== participantId,
  );
  writeJsonArray(STORAGE_KEY, remainingParticipants);

  const deletedParticipantIds = getDeletedParticipantIds();
  deletedParticipantIds.add(participantId);
  writeJsonArray(DELETED_STORAGE_KEY, Array.from(deletedParticipantIds));
}

export function getAdminParticipantProfileMock(participantId: string) {
  const group = getAdminParticipantListMock();
  return group.participants.find((participant) => participant.id === participantId);
}

