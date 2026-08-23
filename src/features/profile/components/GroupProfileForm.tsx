"use client";

import { useState } from "react";
import type {
  EditableGroupProfile,
  MyGroupProfile,
  ProfileGender,
  ProfileGrade,
  ProfilePosition,
} from "../types/profile.types";
import { normalizeMajor } from "../lib/normalize-major";
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

const genderOptions: { label: string; value: ProfileGender }[] = [
  { label: "남", value: "MALE" },
  { label: "여", value: "FEMALE" },
];

const newMemberOptions: { label: string; value: "true" | "false" }[] = [
  { label: "신입", value: "true" },
  { label: "기존", value: "false" },
];

const positionOptions: { label: string; value: ProfilePosition }[] = [
  { label: "일반", value: "MEMBER" },
  { label: "운영진", value: "STAFF" },
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
    position: initialProfile.position,
    major: initialProfile.major,
    isNew: initialProfile.isNew,
    grade: initialProfile.grade,
    gender: initialProfile.gender,
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
          major: normalizeMajor(profile.major),
        });
      }}
    >
      <div className={styles.formBody}>
        <GenderAvatar
          gender={profile.gender === "MALE" ? "male" : "female"}
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

        <ProfileChipField
          label="성별"
          value={profile.gender}
          options={genderOptions}
          onChange={(value) => updateField("gender", value)}
        />

        <ProfileTextField
          label="소속 (학과·팀 등)"
          value={profile.major}
          onChange={(value) => updateField("major", value)}
          onBlur={() => updateField("major", normalizeMajor(profile.major))}
        />

        <ProfileChipField
          label="신입 여부"
          value={profile.isNew ? "true" : "false"}
          options={newMemberOptions}
          onChange={(value) => updateField("isNew", value === "true")}
        />

        <ProfileChipField
          label="직급"
          value={profile.position}
          options={positionOptions}
          onChange={(value) => updateField("position", value)}
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
