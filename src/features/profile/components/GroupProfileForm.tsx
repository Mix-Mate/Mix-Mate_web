"use client";

import { useState } from "react";
import type {
  EditableGroupProfile,
  MyGroupProfile,
  ProfileGender,
  ProfileGrade,
  ProfilePosition,
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

const genderOptions: { label: string; value: ProfileGender }[] = [
  { label: "남", value: "MALE" },
  { label: "여", value: "FEMALE" },
];

const newMemberOptions = [
  { label: "신입", value: "NEW" },
  { label: "기존", value: "EXISTING" },
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
    major: initialProfile.major,
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
          disabled
          onChange={(value) => updateField("displayName", value)}
        />

        <ProfileChipField
          label="학년"
          value={profile.grade}
          options={gradeOptions}
          disabled
          onChange={(value) => updateField("grade", value)}
        />

        <ProfileChipField
          label="성별"
          value={profile.gender}
          options={genderOptions}
          disabled
          onChange={(value) => updateField("gender", value)}
        />

        <ProfileTextField
          label="소속 (학과·팀 등)"
          value={profile.major}
          disabled
          onChange={(value) => updateField("major", value)}
        />

        <ProfileChipField
          label="신입 여부"
          value={initialProfile.isNew ? "NEW" : "EXISTING"}
          options={newMemberOptions}
          disabled
          onChange={() => undefined}
        />

        <ProfileChipField
          label="직급"
          value={initialProfile.position}
          options={positionOptions}
          disabled
          onChange={() => undefined}
        />

        <ProfileMbtiField
          value={profile.mbti}
          disabled
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

