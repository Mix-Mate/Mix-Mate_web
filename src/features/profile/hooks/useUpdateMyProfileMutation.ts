"use client";

import { useState } from "react";
import { updateParticipantProfile } from "../api/profile.api";
import type {
  MyGroupProfile,
  ParticipantProfileRequest,
} from "../types/profile.types";

type UpdateMyProfileInput = {
  groupId: string;
  profile: MyGroupProfile;
};

type UpdateMyProfileResult =
  | { ok: true }
  | { ok: false; message: string };

function toParticipantProfileRequest(
  profile: MyGroupProfile,
): ParticipantProfileRequest {
  return {
    displayName: profile.displayName,
    position: profile.position,
    major: profile.major,
    isNew: profile.isNew,
    grade: profile.grade,
    gender: profile.gender,
    mbti: profile.mbti,
    age: profile.age,
    instaId: profile.instaId,
    bio: profile.bio,
    visibility: profile.visibility,
  };
}

export function useUpdateMyProfileMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async ({
    groupId,
    profile,
  }: UpdateMyProfileInput): Promise<UpdateMyProfileResult> => {
    setIsPending(true);

    try {
      await updateParticipantProfile(
        groupId,
        toParticipantProfileRequest(profile),
      );
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "프로필 수정에 실패했습니다.",
      };
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
  };
}
