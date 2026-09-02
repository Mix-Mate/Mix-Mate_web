"use client";

import { useParams, useRouter } from "next/navigation";
import { useMyGroupProfileQuery } from "@/features/profile/hooks/useMyGroupProfileQuery";
import { formatInstagramDisplay } from "@/features/profile/lib/instagram";
import useToast from "@/shared/hooks/useToast";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./MyProfileScreen.module.css";

const gradeLabelMap = {
  FIRST: "1학년",
  SECOND: "2학년",
  THIRD: "3학년",
  FOURTH: "4학년",
  OTHER: "기타",
} as const;

const genderLabelMap = {
  MALE: "남",
  FEMALE: "여",
} as const;

const positionLabelMap = {
  MEMBER: "일반",
  STAFF: "운영진",
} as const;

export default function MyProfileScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const { data: profile } = useMyGroupProfileQuery(params.groupId);
  const { message: toastMessage, showToast } = useToast();

  if (!profile) {
    return (
      <MobileFrame
        className={styles.screenFrame}
        viewportClassName={styles.pageViewport}
      >
        <Header title="내 프로필" onBack={() => router.back()} />
      </MobileFrame>
    );
  }

  const instagramText = profile.instaId
    ? formatInstagramDisplay(profile.instaId)
    : "등록된 인스타 ID가 없습니다.";

  const copyInstagramId = async () => {
    if (!profile.instaId) return;

    try {
      await navigator.clipboard.writeText(instagramText);
      showToast("인스타 ID가 복사되었습니다.");
    } catch {
      showToast(instagramText);
    }
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
    >
      <Header title="내 프로필" onBack={() => router.back()} />

      <main className={styles.content}>
        <InfoBanner className={styles.notice}>
          <p>현재 그룹에 등록된 내 프로필 정보입니다.</p>
        </InfoBanner>

        <section className={styles.profileHeader}>
          <GenderAvatar
            gender={profile.gender === "MALE" ? "male" : "female"}
            name={profile.displayName}
            toneKey={profile.id}
            size={72}
          />

          <h2>{profile.displayName}</h2>
          <p>{profile.major}</p>

          <div className={styles.badges}>
            {profile.isNew && <span>신입</span>}
            <span>{positionLabelMap[profile.position]}</span>
          </div>
        </section>

        <section className={styles.infoCard}>
          <div>
            <span>학년</span>
            <strong>{gradeLabelMap[profile.grade]}</strong>
          </div>

          <div>
            <span>성별</span>
            <strong>{genderLabelMap[profile.gender]}</strong>
          </div>

          <div>
            <span>소속</span>
            <strong>{profile.major}</strong>
          </div>

          <div>
            <span>신입 여부</span>
            <strong>{profile.isNew ? "신입" : "기존"}</strong>
          </div>

          <div>
            <span>직급</span>
            <strong>{positionLabelMap[profile.position]}</strong>
          </div>

          <div>
            <span>MBTI</span>
            <strong>{profile.mbti}</strong>
          </div>

          <div>
            <span>나이</span>
            <strong>{profile.age ?? "등록된 나이가 없습니다."}</strong>
          </div>

          <div>
            <span>인스타 ID</span>
            {profile.instaId ? (
              <button
                type="button"
                className={styles.instagramButton}
                onClick={copyInstagramId}
                aria-label={`인스타 ID ${instagramText} 복사`}
              >
                {instagramText}
              </button>
            ) : (
              <strong>{instagramText}</strong>
            )}
          </div>

          <div>
            <span>프로필 공개 여부</span>
            <strong>
              {profile.visibility === "PUBLIC" ? "전체 공개" : "비공개"}
            </strong>
          </div>
        </section>

        <section className={styles.bioCard}>
          <span>자기소개</span>
          <p>{profile.bio ?? "자기소개가 없습니다."}</p>
        </section>
      </main>

      {toastMessage && <Toast className={styles.toast}>{toastMessage}</Toast>}
    </MobileFrame>
  );
}
