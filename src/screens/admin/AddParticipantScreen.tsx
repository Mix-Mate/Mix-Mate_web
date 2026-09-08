"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { CircleCheck, FileSpreadsheet, Upload } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { getCurrentGroupRound } from "@/features/group/model/group-status";
import { useAddParticipantMutation } from "@/features/participant/hooks/useAddParticipantMutation";
import { useUploadParticipantsExcelMutation } from "@/features/participant/hooks/useUploadParticipantsExcelMutation";
import type {
  ParticipantExcelUploadResult,
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
import { withSessionContext } from "@/features/session/utils/session-navigation";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";
import Toast from "@/shared/ui/Toast";
import {
  getZodFieldErrors,
  mapServerFieldErrors,
  validateInputField,
} from "@/shared/lib/input-validation";
import styles from "./AddParticipantScreen.module.css";

type AddParticipantMode = "manual" | "excel";

const addParticipantModeTabs: { id: AddParticipantMode; label: string }[] = [
  { id: "manual", label: "직접 입력" },
  { id: "excel", label: "엑셀로 추가" },
];

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

function formatFileSize(size: number) {
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;

  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

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
  const { data: group } = useAdminGroupQuery(params.groupId);
  const roundParam = searchParams.get("round");
  const round = roundParam
    ? toAssignmentRound(roundParam)
    : group
      ? getCurrentGroupRound(group.status)
      : 1;
  const returnToParticipantList =
    searchParams.get("returnTo") === "participant-list";
  const { mutate, isPending } = useAddParticipantMutation();
  const { mutate: uploadExcel, isPending: isUploadingExcel } =
    useUploadParticipantsExcelMutation();
  const { message: toast, showToast } = useToast();
  const [mode, setMode] = useState<AddParticipantMode>("manual");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] =
    useState<ParticipantExcelUploadResult | null>(null);
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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<string, string>>
  >({});

  useEffect(() => {
    if (roundParam) {
      router.replace(
        withSessionContext(
          groupRoutes.adminParticipantNew(
            params.groupId,
            round,
            returnToParticipantList ? "participant-list" : undefined,
          ),
          searchParams,
        ),
      );
    }
  }, [
    params.groupId,
    returnToParticipantList,
    round,
    roundParam,
    router,
    searchParams,
  ]);

  const updateField = <TKey extends keyof AddParticipantForm>(
    field: TKey,
    value: AddParticipantForm[TKey],
  ) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const validateTextField = (field: "displayName" | "major", value: string) => {
    const normalizedValue = value.trim();
    const error = !normalizedValue
      ? field === "displayName"
        ? "이름을 입력해주세요."
        : "소속을 입력해주세요."
      : validateInputField(field, normalizedValue);
    setFieldErrors((current) => ({
      ...current,
      [field]: error ?? undefined,
    }));
    return error;
  };

  const updateTextField = (field: "displayName" | "major", value: string) => {
    updateField(field, value);
    if (fieldErrors[field]) validateTextField(field, value);
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
    const textErrors = {
      displayName:
        validateInputField("displayName", formData.displayName) ??
        (!formData.displayName ? "이름을 입력해주세요." : undefined),
      major:
        validateInputField("major", formData.major) ??
        (!formData.major ? "소속을 입력해주세요." : undefined),
    };
    setFieldErrors(textErrors);
    if (textErrors.displayName || textErrors.major) return;

    const missingFieldMessage = getMissingFieldMessage(formData);

    if (missingFieldMessage) {
      showToast(missingFieldMessage);
      return;
    }

    const validation = groupProfileSchema.safeParse(formData);

    if (!validation.success) {
      setFieldErrors(getZodFieldErrors(validation.error));
      showToast(getValidationMessage(validation.error));
      return;
    }

    const requestBody: ParticipantProfileRequest = validation.data;

    const result = await mutate(params.groupId, requestBody);

    if (!result.ok) {
      if (result.fieldErrors) {
        const mappedErrors = mapServerFieldErrors(result.fieldErrors);
        const profileErrors = Object.fromEntries(
          Object.entries(mappedErrors).filter(([field]) =>
            ["displayName", "major", "instaId", "bio"].includes(field),
          ),
        );
        if (Object.keys(profileErrors).length > 0) {
          setFieldErrors(profileErrors);
          return;
        }
      }
      showToast(result.message);
      return;
    }

    showToast("참가자를 추가했습니다.");

    window.setTimeout(goToParticipantList, 350);
  };

  const handleModeChange = (nextMode: AddParticipantMode) => {
    setMode(nextMode);
    setSelectedFile(null);
    setUploadResult(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
    setUploadResult(null);
  };

  const handleExcelSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      showToast("업로드할 엑셀 파일을 선택해주세요.");
      return;
    }

    const result = await uploadExcel(params.groupId, selectedFile);

    if (!result.ok) {
      showToast(result.message);
      return;
    }

    setUploadResult(result.data);

    if (result.data.failures.length === 0) {
      showToast(`${result.data.successCount}명을 추가했습니다.`);
      window.setTimeout(goToParticipantList, 350);
    }
  };

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="add-participant-screen"
    >
      <Header title="참가자 추가" onBack={goToParticipantList} smallTitle />

      <TabNavigation
        items={addParticipantModeTabs}
        activeItemId={mode}
        ariaLabel="참가자 추가 방식"
        onSelect={(item) => handleModeChange(item.id)}
      />

      {mode === "manual" ? (
      <form className={styles.content} onSubmit={handleSubmit}>
        <InfoBanner className={styles.notice}>
          <p>앱을 사용하지 않는 사람도 등록 가능합니다.</p>
        </InfoBanner>

        <label className={styles.field}>
          <div className={styles.fieldHeader}>
            <span>이름</span>
            <span className={styles.charCount}>
              {form.displayName.length}/10
            </span>
          </div>
          <input
            value={form.displayName}
            onChange={(event) =>
              updateTextField("displayName", event.target.value)
            }
            onBlur={() => validateTextField("displayName", form.displayName)}
            placeholder="이름 입력"
            aria-invalid={Boolean(fieldErrors.displayName)}
          />
          {fieldErrors.displayName && (
            <small className={styles.fieldError} role="alert">
              {fieldErrors.displayName}
            </small>
          )}
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
                className={
                  form.gender === option.value ? styles.activeChip : ""
                }
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
            onChange={(event) => updateTextField("major", event.target.value)}
            onBlur={() => validateTextField("major", form.major)}
            aria-invalid={Boolean(fieldErrors.major)}
          />
          {fieldErrors.major && (
            <small className={styles.fieldError} role="alert">
              {fieldErrors.major}
            </small>
          )}
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
                className={
                  form.position === option.value ? styles.activeChip : ""
                }
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
      ) : (
      <form className={styles.content} onSubmit={handleExcelSubmit}>
        <InfoBanner className={styles.notice}>
          <p>엑셀 파일로 여러 명을 한 번에 등록할 수 있습니다.</p>
        </InfoBanner>

        <div className={styles.fileField}>
          <span className={styles.fileFieldLabel}>엑셀 파일</span>

          {selectedFile ? (
            <label className={styles.selectedFile}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
              <span className={styles.selectedFileIcon}>
                <FileSpreadsheet size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className={styles.selectedFileInfo}>
                <span className={styles.selectedFileName}>
                  {selectedFile.name}
                </span>
                <span className={styles.selectedFileMeta}>
                  {formatFileSize(selectedFile.size)} · 다시 눌러 변경
                </span>
              </span>
            </label>
          ) : (
            <label className={styles.filePicker}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
              <span className={styles.pickerIcon}>
                <Upload size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className={styles.pickerTitle}>엑셀 파일 선택</span>
              <span className={styles.pickerHint}>.xlsx, .xls 형식 지원</span>
            </label>
          )}
        </div>

        {uploadResult && (
          <div className={styles.uploadResult}>
            <p className={styles.uploadResultTitle}>
              <CircleCheck size={16} strokeWidth={2.2} aria-hidden="true" />
              {uploadResult.successCount}명 등록 완료
            </p>

            {uploadResult.failures.length > 0 && (
              <div className={styles.uploadFailures}>
                <span className={styles.uploadFailuresTitle}>
                  {uploadResult.failures.length}건 등록 실패
                </span>
                <ul>
                  {uploadResult.failures.map((failure) => (
                    <li key={failure.row}>
                      <span className={styles.failureRow}>{failure.row}행</span>
                      <span>{failure.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <Button type="submit" disabled={isUploadingExcel}>
            업로드
          </Button>
        </div>
      </form>
      )}

      {toast && <Toast className={styles.toast}>{toast}</Toast>}
    </MobileFrame>
  );
}
