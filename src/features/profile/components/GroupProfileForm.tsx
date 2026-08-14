"use client";

import { useState } from "react";
import type {
  EditableGroupProfile,
  MyGroupProfile,
  ProfileGrade,
} from "../types/profile.types";
import ProfileChipField from "./ProfileChipField";
import ProfileMbtiField from "./ProfileMbtiField";
import ProfileTextAreaField from "./ProfileTextAreaField";
import ProfileTextField from "./ProfileTextField";
import ProfileVisibilityField from "./ProfileVisibilityField";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "@/screens/common/EditMyProfileScreen.module.css";

interface GroupProfileFormProps {
  mode: "setup" | "edit";
  initialProfile: MyGroupProfile;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (profile: MyGroupProfile) => void | Promise<void>;
}

const gradeOptions: { label: string; value: ProfileGrade }[] = [
  { label: "1학년", value: "FIRST" },
  { label: "2학년", value: "SECOND" },
  { label: "3학년", value: "THIRD" },
  { label: "4학년", value: "FOURTH" },
];

export default function GroupProfileForm({
  mode,
  initialProfile,
  isSubmitting,
  submitLabel,
  onSubmit,
}: GroupProfileFormProps) {
  const [profile, setProfile] = useState<EditableGroupProfile>({
    displayName: initialProfile.displayName,
    major: initialProfile.major,
    grade: initialProfile.grade,
    mbti: initialProfile.mbti,
    age: initialProfile.age,
    instaId: initialProfile.instaId,
    bio: initialProfile.bio,
    visibility: initialProfile.visibility,
  });

  const updateField = <TKey extends keyof EditableGroupProfile>(
    field: TKey,
    value: EditableGroupProfile[TKey],
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      className={styles.form}
      data-mode={mode}
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({
          ...initialProfile,
          ...profile,
        });
      }}
    >
      <div className={styles.formBody}>
        <GenderAvatar
          gender={initialProfile.gender === "MALE" ? "male" : "female"}
          name={profile.displayName}
          size={52}
          className={styles.profileAvatar}
        />

        <ProfileTextField
          label="이름"
          value={profile.displayName}
          required
          onChange={(value) => updateField("displayName", value)}
        />

        <ProfileChipField
          label="학년"
          value={profile.grade}
          options={gradeOptions}
          onChange={(value) => updateField("grade", value)}
        />

        <ProfileTextField
          label="소속 (학과·팀 등)"
          value={profile.major}
          onChange={(value) => updateField("major", value)}
        />

        <ProfileMbtiField
          value={profile.mbti}
          onChange={(value) => updateField("mbti", value)}
        />

        <ProfileTextField
          label="나이 (선택)"
          value={profile.age === null ? "" : String(profile.age)}
          inputMode="numeric"
          onChange={(value) => {
            const trimmedValue = value.trim();
            updateField(
              "age",
              trimmedValue ? Number(trimmedValue.replace(/[^0-9]/g, "")) : null,
            );
          }}
        />

        <ProfileTextField
          label="인스타 ID (선택)"
          value={profile.instaId ?? ""}
          onChange={(value) => updateField("instaId", value || null)}
        />

        <ProfileTextAreaField
          label="자기소개 (선택)"
          value={profile.bio ?? ""}
          onChange={(value) => updateField("bio", value || null)}
        />

        <ProfileVisibilityField
          value={profile.visibility}
          onChange={(value) => updateField("visibility", value)}
        />
      </div>

      <div className={styles.formActions}>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
