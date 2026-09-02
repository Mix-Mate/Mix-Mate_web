"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAddParticipantMutation } from "@/features/participant/hooks/useAddParticipantMutation";
import type {
  ParticipantProfileRequest,
  ProfileGender,
  ProfileGrade,
  ProfileMbti,
  ProfilePosition,
  ProfileVisibility,
} from "@/features/participant/types/participant.types";
import ProfileMbtiField from "@/features/profile/components/ProfileMbtiField";
import {
  getValidationMessage,
  groupProfileSchema,
} from "@/features/profile/schemas/group-profile.schema";
import useToast from "@/shared/hooks/useToast";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./AddParticipantScreen.module.css";

const gradeOptions: { label: string; value: ProfileGrade }[] = [
  { label: "1학년", value: "FIRST" },
  { label: "2학년", value: "SECOND" },
  { label: "3학년", value: "THIRD" },
  { label: "4학년", value: "FOURTH" },
  { label: "기타", value: "OTHER" },
];

const genderOptions: { label: string; value: ProfileGender }[] = [
  { label: "남", value: "MALE" },
  { label: "여", value: "FEMALE" },
];

const isNewOptions = [
  { label: "신입", value: true },
  { label: "기존", value: false },
];

const positionOptions: { label: string; value: ProfilePosition }[] = [
  { label: "일반", value: "MEMBER" },
  { label: "운영진", value: "STAFF" },
];

const visibilityOptions: { label: string; value: ProfileVisibility }[] = [
  { label: "전체 공개", value: "PUBLIC" },
  { label: "비공개", value: "PRIVATE" },
];

type AddParticipantForm = {
  displayName: string;
  position: ProfilePosition | null;
  major: string;
  isNew: boolean | null;
  grade: ProfileGrade | null;
  gender: ProfileGender | null;
  mbti: ProfileMbti | null;
  age: null;
  instaId: null;
  bio: null;
  visibility: ProfileVisibility | null;
};

function getMissingFieldMessage(form: AddParticipantForm) {
  if (!form.displayName.trim()) return "이름을 입력해주세요.";
  if (!form.grade) return "학년을 선택해주세요.";
  if (!form.gender) return "성별을 선택해주세요.";
  if (!form.major.trim()) return "소속을 입력해주세요.";
  if (form.isNew === null) return "신입 여부를 선택해주세요.";
  if (!form.position) return "직급을 선택해주세요.";
  if (!form.mbti) return "MBTI를 선택해주세요.";
  if (!form.visibility) return "프로필 공개 여부를 선택해주세요.";

  return null;
}

export default function AddParticipantScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const round = toAssignmentRound(searchParams.get("round") ?? "1");
  const returnToParticipantList =
    searchParams.get("returnTo") === "participant-list";
  const { mutate, isPending } = useAddParticipantMutation();
  const { message: toast, showToast } = useToast();
  const [form, setForm] = useState<AddParticipantForm>({
    displayName: "",
    position: null,
    major: "",
    isNew: null,
    grade: null,
    gender: null,
    mbti: null,
    age: null,
    instaId: null,
    bio: null,
    visibility: null,
  });

  const updateField = <TKey extends keyof AddParticipantForm>(
    field: TKey,
    value: AddParticipantForm[TKey],
  ) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const goToParticipantList = () => {
    router.push(
      returnToParticipantList
        ? groupRoutes.participants(params.groupId, round)
        : groupRoutes.adminParticipants(params.groupId, round),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = {
      ...form,
      displayName: form.displayName.trim(),
      major: form.major.trim(),
    };
    const missingFieldMessage = getMissingFieldMessage(formData);

    if (missingFieldMessage) {
      showToast(missingFieldMessage);
      return;
    }

    const validation = groupProfileSchema.safeParse(formData);

    if (!validation.success) {
      showToast(getValidationMessage(validation.error));
      return;
    }

    const requestBody: ParticipantProfileRequest = validation.data;

    const result = await mutate(params.groupId, requestBody);

    if (!result.ok) {
      showToast(result.message);
      return;
    }

    showToast("참가자를 추가했습니다.");

    window.setTimeout(goToParticipantList, 350);
  };

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="add-participant-screen"
    >
      <Header title="참가자 추가" onBack={goToParticipantList} smallTitle />

      <form className={styles.content} onSubmit={handleSubmit}>
        <InfoBanner className={styles.notice}>
          <p>앱을 사용하지 않는 사람도 등록 가능합니다.</p>
        </InfoBanner>

        <label className={styles.field}>
          <span>이름</span>
          <input
            value={form.displayName}
            maxLength={10}
            onChange={(event) => updateField("displayName", event.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span>학년</span>
          <div className={styles.chipGroup}>
            {gradeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={form.grade === option.value ? styles.activeChip : ""}
                onClick={() => updateField("grade", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span>성별</span>
          <div className={styles.chipGroup}>
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={form.gender === option.value ? styles.activeChip : ""}
                onClick={() => updateField("gender", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.field}>
          <span>소속</span>
          <input
            value={form.major}
            maxLength={15}
            onChange={(event) => updateField("major", event.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span>신입 여부</span>
          <div className={styles.chipGroup}>
            {isNewOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                className={form.isNew === option.value ? styles.activeChip : ""}
                onClick={() => updateField("isNew", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span>직급</span>
          <div className={styles.chipGroup}>
            {positionOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={form.position === option.value ? styles.activeChip : ""}
                onClick={() => updateField("position", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <ProfileMbtiField
          value={form.mbti}
          onChange={(value) => updateField("mbti", value)}
        />

        <div className={styles.field}>
          <span>프로필 공개 여부</span>
          <div className={styles.chipGroup}>
            {visibilityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  form.visibility === option.value ? styles.activeChip : ""
                }
                onClick={() => updateField("visibility", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <Button type="submit" disabled={isPending}>
            추가하기
          </Button>
        </div>
      </form>

      {toast && <Toast className={styles.toast}>{toast}</Toast>}
    </MobileFrame>
  );
}
