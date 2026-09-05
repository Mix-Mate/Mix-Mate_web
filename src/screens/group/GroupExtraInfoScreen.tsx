"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Button from "@/shared/ui/Button";
import {
  createGroupApi,
  joinGroupWithProfileApi,
  GroupApiError,
  type GroupProfileDto,
} from "@/features/group/api/group.api";
import { normalizeMajor } from "@/features/profile/lib/normalize-major";
import {
  getValidationMessage,
  groupProfileSchema,
} from "@/features/profile/schemas/group-profile.schema";
import { getGroupEntryRoute } from "@/features/group/lib/group-entry-route";
import {
  cleanInstagramForSubmit,
  formatInstagramDisplay,
  handleInstagramInputBlur,
  handleInstagramInputChange,
  handleInstagramInputFocus,
  handleInstagramInputKeyDown,
} from "@/features/profile/lib/instagram";
import styles from "./GroupExtraInfoScreen.module.css";

const MBTI_LIST = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
] as const;

export type GradeType = "1학년" | "2학년" | "3학년" | "4학년" | "기타" | "";
export type GenderType = "남" | "여" | "";
export type NewStatusType = "신입" | "기존" | "";
export type RolePositionType = "일반" | "운영진" | "";
export type ProfilePublicType = "전체 공개" | "비공개";

const gradeOptions: GradeType[] = ["1학년", "2학년", "3학년", "4학년", "기타"];
const genderOptions: GenderType[] = ["남", "여"];
const isNewOptions: NewStatusType[] = ["신입", "기존"];
const positionOptions: RolePositionType[] = ["일반", "운영진"];
const visibilityOptions: ProfilePublicType[] = ["전체 공개", "비공개"];

export interface GroupExtraInfoData {
  name: string;
  grade: GradeType;
  gender: GenderType;
  department: string;
  isNew: NewStatusType;
  rolePosition: RolePositionType;
  mbti: string;
  age: string;
  instagramId: string;
  bio: string;
  isPublicProfile: ProfilePublicType;
}

interface GroupExtraInfoScreenProps {
  groupId?: string;
  initialData?: Partial<GroupExtraInfoData>;
  onSuccess?: (data: GroupExtraInfoData) => void;
}

export default function GroupExtraInfoScreen({
  groupId = "1",
  initialData,
  onSuccess,
}: GroupExtraInfoScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  // Form states
  const [name, setName] = useState(initialData?.name ?? "");
  const [grade, setGrade] = useState<GradeType>(initialData?.grade ?? "");
  const [gender, setGender] = useState<GenderType>(initialData?.gender ?? "");
  const [department, setDepartment] = useState(initialData?.department ?? "");
  const [isNew, setIsNew] = useState<NewStatusType>(initialData?.isNew ?? "");
  const [rolePosition, setRolePosition] = useState<RolePositionType>(
    initialData?.rolePosition ?? (roleParam === "admin" ? "운영진" : ""),
  );
  const [mbti, setMbti] = useState<string>(initialData?.mbti ?? "");
  const [age, setAge] = useState(initialData?.age ?? "");
  const [instagramId, setInstagramId] = useState(
    formatInstagramDisplay(initialData?.instagramId),
  );
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [isPublicProfile, setIsPublicProfile] = useState<ProfilePublicType>(
    initialData?.isPublicProfile ?? "전체 공개",
  );

  const [isMbtiOpen, setIsMbtiOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsMbtiOpen(false);
      }
    };
    if (isMbtiOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMbtiOpen]);

  const handleBack = () => {
    router.back();
  };

  const isFormValid = name.trim().length > 0 && department.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    const cleanedInstaId = cleanInstagramForSubmit(instagramId);

    const extraData: GroupExtraInfoData = {
      name: name.trim(),
      grade,
      gender,
      department: department.trim(),
      isNew,
      rolePosition,
      mbti,
      age: age.trim(),
      instagramId: cleanedInstaId ?? "",
      bio: bio.trim(),
      isPublicProfile,
    };

    const gradeMap: Record<string, string> = {
      "1학년": "FIRST",
      "2학년": "SECOND",
      "3학년": "THIRD",
      "4학년": "FOURTH",
      기타: "OTHER",
    };
    const genderMap: Record<string, string> = {
      남: "MALE",
      여: "FEMALE",
    };

    const profileFormData = {
      displayName: name.trim(),
      position: rolePosition
        ? rolePosition === "운영진"
          ? "STAFF"
          : "MEMBER"
        : undefined,
      major: normalizeMajor(department.trim()),
      isNew: isNew ? isNew === "신입" : undefined,
      grade: grade ? gradeMap[grade] : undefined,
      gender: gender ? genderMap[gender] : undefined,
      mbti: mbti || undefined,
      age: age.trim() ? Number(age) : null,
      instaId: cleanedInstaId,
      bio: bio.trim() || null,
      visibility: isPublicProfile === "전체 공개" ? "PUBLIC" : "PRIVATE",
    };
    const validation = groupProfileSchema.safeParse(profileFormData);

    if (!validation.success) {
      alert(getValidationMessage(validation.error));
      setIsSubmitting(false);
      return;
    }

    const profileDto: GroupProfileDto = {
      ...validation.data,
      age: validation.data.age ?? 20,
      instaId: validation.data.instaId ?? undefined,
      bio: validation.data.bio ?? undefined,
    };

    const fromParam = searchParams.get("from");
    const inviteCodeParam =
      searchParams.get("inviteCode") ||
      (typeof window !== "undefined" &&
        window.sessionStorage.getItem("pendingInviteCode")) ||
      "";

    const isCreateFlow = fromParam === "create" || groupId === "new";

    try {
      if (isCreateFlow) {
        const groupNameParam =
          searchParams.get("groupName") ||
          (typeof window !== "undefined" &&
            window.sessionStorage.getItem("pendingGroupName")) ||
          `${name.trim()}의 모임`;
        const descriptionParam =
          searchParams.get("description") ||
          (typeof window !== "undefined" &&
            window.sessionStorage.getItem("pendingGroupDesc")) ||
          "";

        const response = await createGroupApi({
          groupName: groupNameParam,
          description: descriptionParam,
          profile: profileDto,
        });

        alert("그룹이 성공적으로 생성되었습니다!");
        router.replace(
          getGroupEntryRoute(String(response.groupId), "HOST", "RECRUITING"),
        );
        return;
      }

      // 일반 참여/입장 플로우: 참여코드와 함께 프로필 등록 API 호출
      if (inviteCodeParam) {
        const joinRes = await joinGroupWithProfileApi({
          inviteCode: inviteCodeParam,
          profile: profileDto,
        });

        alert("그룹에 성공적으로 참여하였습니다!");
        const targetGroupId = joinRes.groupId
          ? String(joinRes.groupId)
          : groupId;
        router.replace(getGroupEntryRoute(targetGroupId, "PARTICIPANT"));
        return;
      }

      if (onSuccess) {
        onSuccess(extraData);
      } else {
        router.replace(getGroupEntryRoute(groupId, "PARTICIPANT"));
      }
    } catch (error: unknown) {
      if (error instanceof GroupApiError && error.status === 401) {
        alert("토큰이 없거나 만료되었습니다. 다시 로그인해 주세요.");
        router.push("/login");
        return;
      }
      alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="group-extra-info-screen"
    >
      {/* 1. 상단 헤더: 공통 Header 컴포넌트 적용 */}
      <Header title="그룹별 추가 정보 입력" onBack={handleBack} smallTitle />

      {/* 2. 메인 폼 컨텐츠 (내부 스크롤) */}
      <form id="group-extra-form" className={styles.content} onSubmit={handleSubmit}>
        {/* 안내 배너: 파란 배경 박스 (멘트 색상 #27272A) */}
        <InfoBanner className={styles.notice}>
          <p>자리 배치와 프로필에 사용됩니다.</p>
        </InfoBanner>

        {/* 1. 이름 확인 (필수*) */}
        <label className={styles.field}>
          <div className={styles.fieldHeader}>
            <span>
              이름 확인 <strong className={styles.required}>*</strong>
            </span>
            <span className={styles.charCount}>{name.length}/10</span>
          </div>
          <input
            value={name}
            maxLength={10}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
            required
          />
        </label>

        {/* 2. 학년 (단일 선택 칩) */}
        <div className={styles.field}>
          <span>학년</span>
          <div className={styles.chipGroup}>
            {gradeOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={grade === item ? styles.activeChip : ""}
                onClick={() => setGrade(grade === item ? "" : item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 성별 (단일 선택 칩) */}
        <div className={styles.field}>
          <span>성별</span>
          <div className={styles.chipGroup}>
            {genderOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={gender === item ? styles.activeChip : ""}
                onClick={() => setGender(gender === item ? "" : item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 4. 소속 (필수) */}
        <label className={styles.field}>
          <span>
            소속 <span className={styles.helperTextRed}>*정식 명칭을 입력해 주세요.</span>
          </span>
          <input
            value={department}
            maxLength={15}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="소속 입력"
            required
          />
        </label>

        {/* 5. 신입 여부 (단일 선택 칩) */}
        <div className={styles.field}>
          <span>신입 여부</span>
          <div className={styles.chipGroup}>
            {isNewOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={isNew === item ? styles.activeChip : ""}
                onClick={() => setIsNew(isNew === item ? "" : item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 6. 직급 (단일 선택 칩) */}
        <div className={styles.field}>
          <span>직급</span>
          <div className={styles.chipGroup}>
            {positionOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={rolePosition === item ? styles.activeChip : ""}
                onClick={() => setRolePosition(rolePosition === item ? "" : item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 7. MBTI (커스텀 드롭다운) */}
        <div
          className={styles.field}
          ref={dropdownRef}
          style={{ position: "relative" }}
        >
          <span>MBTI</span>
          <button
            type="button"
            className={`${styles.dropdownTrigger} ${
              mbti ? styles.hasValue : ""
            } ${isMbtiOpen ? styles.dropdownTriggerActive : ""}`}
            onClick={() => setIsMbtiOpen((prev) => !prev)}
            aria-expanded={isMbtiOpen}
          >
            <span>{mbti || "MBTI 선택"}</span>
            <span
              className={`${styles.dropdownArrow} ${
                isMbtiOpen ? styles.dropdownArrowOpen : ""
              }`}
            >
              ▾
            </span>
          </button>

          {isMbtiOpen && (
            <div className={styles.dropdownMenu}>
              {MBTI_LIST.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.dropdownItem} ${
                    mbti === item ? styles.dropdownItemActive : ""
                  }`}
                  onClick={() => {
                    setMbti(item);
                    setIsMbtiOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 8. 나이 (선택) */}
        <label className={styles.field}>
          <span>나이 (선택)</span>
          <input
            value={age}
            inputMode="numeric"
            maxLength={10}
            onChange={(e) =>
              setAge(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
            }
            placeholder="나이 입력"
          />
        </label>

        {/* 9. 인스타 ID (선택) */}
        <label className={styles.field}>
          <span>인스타 ID (선택)</span>
          <input
            value={instagramId}
            maxLength={31}
            onChange={(e) => handleInstagramInputChange(e, setInstagramId)}
            onFocus={() => handleInstagramInputFocus(instagramId, setInstagramId)}
            onBlur={() => handleInstagramInputBlur(instagramId, setInstagramId)}
            onKeyDown={handleInstagramInputKeyDown}
            placeholder="@아이디 입력"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>

        {/* 10. 자기소개 (선택) */}
        <label className={styles.field}>
          <span>자기소개 (선택)</span>
          <textarea
            className={styles.textArea}
            value={bio}
            maxLength={50}
            onChange={(e) => setBio(e.target.value)}
            placeholder="자기소개를 입력해 주세요"
          />
        </label>

        {/* 11. 프로필 공개 여부 (필수*) */}
        <div className={styles.field}>
          <span>
            프로필 공개 여부 <strong className={styles.required}>*</strong>
          </span>
          <div className={styles.chipGroup}>
            {visibilityOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={isPublicProfile === item ? styles.activeChip : ""}
                onClick={() => setIsPublicProfile(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* 3. 하단 고정 저장 버튼 */}
      <div className={styles.footer}>
        <Button
          type="submit"
          form="group-extra-form"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "저장하기"}
        </Button>
      </div>
    </MobileFrame>
  );
}
