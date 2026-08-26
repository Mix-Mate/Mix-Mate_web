"use client";

import { useState } from "react";
import { updateParticipantProfile } from "../api/profile.api";
import { saveMyGroupProfile } from "../lib/profile-storage";
import type {
  MyGroupProfile,
  ParticipantProfileRequest,
} from "../types/profile.types";
import { shouldUseMockFallback } from "@/shared/api/apiError";

type UpdateMyProfileInput = {
  groupId: string;
  profile: MyGroupProfile;
};

type UpdateMyProfileResult =
  | { ok: true }
  | { ok: false; message: string; savedLocally: boolean };

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
      saveMyGroupProfile(profile);
      return { ok: true };
    } catch (error) {
      const savedLocally = shouldUseMockFallback(error);

      if (savedLocally) {
        saveMyGroupProfile(profile);
      }

      return {
        ok: false,
        savedLocally,
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
