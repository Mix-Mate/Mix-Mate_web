"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Button from "@/shared/ui/Button";
import {
  joinGroupByInvitationApi,
  GroupJoinProfile,
  GroupApiError,
} from "@/features/group/api/group.api";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import styles from "./GroupExtraInfoScreen.module.css";

const MBTI_LIST = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
] as const;

export type GradeType = "1학년" | "2학년" | "3학년" | "4학년" | "";
export type GenderType = "남" | "여" | "";
export type NewStatusType = "신입" | "기존" | "";
export type RolePositionType = "일반" | "운영진" | "";
export type ProfilePublicType = "전체 공개" | "비공개";

const gradeOptions: GradeType[] = ["1학년", "2학년", "3학년", "4학년"];
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
  const inviteCodeParam =
    searchParams.get("inviteCode") || searchParams.get("code") || groupId;

  // Form states
  const [name, setName] = useState(initialData?.name ?? "");
  const [grade, setGrade] = useState<GradeType>(initialData?.grade ?? "1학년");
  const [gender, setGender] = useState<GenderType>(initialData?.gender ?? "남");
  const [department, setDepartment] = useState(initialData?.department ?? "");
  const [isNew, setIsNew] = useState<NewStatusType>(initialData?.isNew ?? "신입");
  const [rolePosition, setRolePosition] = useState<RolePositionType>(
    initialData?.rolePosition ?? (roleParam === "admin" ? "운영진" : "일반"),
  );
  const [mbti, setMbti] = useState<string>(initialData?.mbti ?? "ENFP");
  const [age, setAge] = useState(initialData?.age ?? "20");
  const [instagramId, setInstagramId] = useState(initialData?.instagramId ?? "");
  const [bio, setBio] = useState(initialData?.bio ?? "");
  const [isPublicProfile, setIsPublicProfile] = useState<ProfilePublicType>(
    initialData?.isPublicProfile ?? "전체 공개",
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

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

  const handleNameChange = (val: string) => {
    setName(val);
    if (fieldErrors.displayName || fieldErrors.name) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.displayName;
        delete next.name;
        return next;
      });
    }
  };

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    if (fieldErrors.major || fieldErrors.department) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.major;
        delete next.department;
        return next;
      });
    }
  };

  const isFormValid = name.trim().length > 0 && department.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const gradeMap: Record<string, string> = {
      "1학년": "FIRST",
      "2학년": "SECOND",
      "3학년": "THIRD",
      "4학년": "FOURTH",
    };

    const profileData: GroupJoinProfile = {
      displayName: name.trim(),
      position:
        rolePosition === "운영진" || roleParam === "admin" ? "STAFF" : "MEMBER",
      major: department.trim(),
      isNew: isNew === "신입",
      grade: gradeMap[grade] || "FIRST",
      gender: gender === "남" ? "MALE" : "FEMALE",
      mbti: mbti || "ISTJ",
      age: parseInt(age, 10) || 20,
      instaId: instagramId.trim() || undefined,
      bio: bio.trim() || undefined,
      visibility: isPublicProfile === "전체 공개" ? "PUBLIC" : "PRIVATE",
    };

    const extraData: GroupExtraInfoData = {
      name: name.trim(),
      grade,
      gender,
      department: department.trim(),
      isNew,
      rolePosition,
      mbti,
      age: age.trim(),
      instagramId: instagramId.trim(),
      bio: bio.trim(),
      isPublicProfile,
    };

    try {
      if (onSuccess) {
        onSuccess(extraData);
      } else {
        // 그룹 입장(참여코드 + 프로필) API 호출
        const response = await joinGroupByInvitationApi({
          inviteCode: inviteCodeParam,
          profile: profileData,
        });

        alert("그룹에 참여했습니다.");
        const targetGroupId = response.groupId || groupId;
        router.push(groupRoutes.home(String(targetGroupId)));
      }
    } catch (error: unknown) {
      if (error instanceof GroupApiError) {
        if (
          error.status === 400 &&
          error.fieldErrors &&
          Object.keys(error.fieldErrors).length > 0
        ) {
          // 400 에러: errors 객체의 필드별 메시지를 해당 입력 폼 하단에 빨간색 텍스트로 노출
          setFieldErrors(error.fieldErrors);
        } else if (error.status === 401) {
          // 401 에러: 세션 만료 안내 후 로그인 이동
          alert("토큰이 없거나 만료되었습니다. 다시 로그인해 주세요.");
          router.push("/login");
        } else if (error.status === 404 || error.status === 409) {
          // 404 / 409 에러: response.data.message 알림 표시 또는 폼 에러 안내
          alert(error.message);
          setGeneralError(error.message);
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "그룹 참여 중 오류가 발생했습니다.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nameError = fieldErrors.displayName || fieldErrors.name;
  const majorError = fieldErrors.major || fieldErrors.department;

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="group-extra-info-screen"
    >
      {/* 1. 상단 헤더: 공통 Header 컴포넌트 적용 */}
      <Header title="그룹별 추가 정보 입력" onBack={handleBack} smallTitle />

      {/* 2. 메인 폼 컨텐츠 (내부 스크롤) */}
      <form id="group-extra-form" className={styles.content} onSubmit={handleSubmit} noValidate>
        {/* 안내 배너: 파란 배경 박스 (멘트 색상 #27272A) */}
        <InfoBanner className={styles.notice}>
          <p>자리 배치와 프로필에 사용됩니다.</p>
        </InfoBanner>

        {/* 1. 이름 확인 (필수*) */}
        <label className={styles.field}>
          <span>
            이름 확인 <strong className={styles.required}>*</strong>
          </span>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="이름 입력"
            required
            className={nameError ? styles.inputError : ""}
          />
          {nameError && (
            <span className={styles.fieldError} role="alert">
              {nameError}
            </span>
          )}
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
          {fieldErrors.grade && (
            <span className={styles.fieldError} role="alert">
              {fieldErrors.grade}
            </span>
          )}
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
          {fieldErrors.gender && (
            <span className={styles.fieldError} role="alert">
              {fieldErrors.gender}
            </span>
          )}
        </div>

        {/* 4. 소속 (필수) */}
        <label className={styles.field}>
          <span>
            소속 <span className={styles.helperTextRed}>*정식 명칭을 입력해 주세요.</span>
          </span>
          <input
            value={department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            placeholder="소속 입력"
            required
            className={majorError ? styles.inputError : ""}
          />
          {majorError && (
            <span className={styles.fieldError} role="alert">
              {majorError}
            </span>
          )}
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
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="나이 입력"
            min={1}
            max={120}
          />
          {fieldErrors.age && (
            <span className={styles.fieldError} role="alert">
              {fieldErrors.age}
            </span>
          )}
        </label>

        {/* 9. 인스타 ID (선택) */}
        <label className={styles.field}>
          <span>인스타 ID (선택)</span>
          <input
            value={instagramId}
            onChange={(e) => setInstagramId(e.target.value)}
            placeholder="@아이디 입력"
          />
          {fieldErrors.instaId && (
            <span className={styles.fieldError} role="alert">
              {fieldErrors.instaId}
            </span>
          )}
        </label>

        {/* 10. 자기소개 (선택) */}
        <label className={styles.field}>
          <span>자기소개 (선택)</span>
          <textarea
            className={styles.textArea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="자기소개를 입력해 주세요"
          />
          {fieldErrors.bio && (
            <span className={styles.fieldError} role="alert">
              {fieldErrors.bio}
            </span>
          )}
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

        {/* 공통 에러 알림 */}
        {generalError && (
          <div className={styles.generalError} role="alert">
            {generalError}
          </div>
        )}
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
