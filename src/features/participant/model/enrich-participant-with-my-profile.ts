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
    name: myProfile.displayName || participant.name,
    department: myProfile.major || participant.department,
    visibility: myProfile.visibility
      ? myProfile.visibility === "PUBLIC"
        ? "public"
        : "private"
      : participant.visibility,
    role: myProfile.position
      ? myProfile.position === "STAFF"
        ? "staff"
        : "general"
      : participant.role,
    gender: myProfile.gender
      ? myProfile.gender === "FEMALE"
        ? "female"
        : "male"
      : participant.gender,
    grade: getProfileGradeLabel(myProfile.grade) ?? participant.grade,
    isNew: myProfile.isNew ?? participant.isNew,
    mbti: myProfile.mbti ?? participant.mbti,
    age: myProfile.age ?? participant.age,
    instagramId: myProfile.instaId ?? participant.instagramId,
    bio: myProfile.bio ?? participant.bio,
  };
}
