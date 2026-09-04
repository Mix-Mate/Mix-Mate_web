import type { MyGroupProfile } from "@/features/profile/types/profile.types";
import { getProfileGradeLabel } from "@/shared/lib/profile-labels";
import type { Participant } from "../types/participant.types";

export function resolveMyParticipantId(
  myProfile: MyGroupProfile | null | undefined,
  fallbackParticipantId?: number | string | null,
) {
  if (myProfile?.id && myProfile.id !== "me") {
    return myProfile.id;
  }

  return fallbackParticipantId ? String(fallbackParticipantId) : null;
}

export function enrichParticipantWithMyProfile<TParticipant extends Participant>(
  participant: TParticipant,
  myProfile: MyGroupProfile | null | undefined,
  myParticipantId: string | null,
): TParticipant {
  if (!myProfile) {
    return participant;
  }

  const matchesById = Boolean(myParticipantId && participant.id === myParticipantId);
  const matchesByProfile =
    participant.name === myProfile.displayName &&
    participant.department === myProfile.major;

  if (!matchesById && !matchesByProfile) {
    return participant;
  }

  return {
    ...participant,
    name: myProfile.displayName,
    department: myProfile.major,
    visibility: myProfile.visibility === "PUBLIC" ? "public" : "private",
    role: myProfile.position === "STAFF" ? "staff" : "general",
    gender: myProfile.gender === "FEMALE" ? "female" : "male",
    grade: getProfileGradeLabel(myProfile.grade) ?? participant.grade,
    isNew: myProfile.isNew,
    mbti: myProfile.mbti,
    age: myProfile.age ?? undefined,
    instagramId: myProfile.instaId ?? undefined,
    bio: myProfile.bio ?? undefined,
  };
}
