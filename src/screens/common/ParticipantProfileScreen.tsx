"use client";

import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { useParticipantProfileQuery } from "@/features/participant/hooks/useParticipantProfileQuery";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./ParticipantProfileScreen.module.css";

interface ParticipantProfileScreenProps {
  groupId: string;
  participantId: string;
}

export default function ParticipantProfileScreen({
  participantId,
}: ParticipantProfileScreenProps) {
  const router = useRouter();
  const { data: profile } = useParticipantProfileQuery(participantId);
  const shouldBlockPrivateProfile = profile.visibility === "private";
  const instagramText = profile.instagramId ?? "등록된 인스타 ID가 없습니다.";
  const bioText = profile.bio ?? "자기소개가 없습니다.";

  return (
    <MobileFrame className={styles.phone} viewportClassName={styles.viewport}>
      {!shouldBlockPrivateProfile && (
        <Header title="참가자 프로필" onBack={() => router.back()} />
      )}

      <main
        className={
          shouldBlockPrivateProfile ? styles.privateContent : styles.content
        }
      >
        {shouldBlockPrivateProfile && (
          <div className={styles.sheetHandle} aria-hidden="true" />
        )}

        <section className={styles.profileHeader}>
          <GenderAvatar gender={profile.gender} name={profile.name} size={72} />
          <h2>{profile.name}</h2>
          <p>{profile.department}</p>

          {!shouldBlockPrivateProfile && (
            <div className={styles.badges}>
              {profile.isNew && <span>신입</span>}
              {profile.role === "staff" && <span>운영진</span>}
              {profile.role === "general" && !profile.isNew && <span>일반</span>}
            </div>
          )}
        </section>

        {shouldBlockPrivateProfile ? (
          <>
            <div className={styles.privateDivider} />

            <section className={styles.privateBox}>
              <LockKeyhole size={34} />
              <strong>비공개 프로필입니다</strong>
              <p>
                해당 참가자의 상세 프로필
                <br />
                정보는 확인할 수 없습니다.
              </p>
            </section>

            <Button onClick={() => router.back()}>닫기</Button>
          </>
        ) : (
          <>
            <section className={styles.infoCard}>
              <div>
                <span>학년</span>
                <strong>{profile.grade}</strong>
              </div>

              <div>
                <span>성별</span>
                <strong>{profile.gender === "female" ? "여" : "남"}</strong>
              </div>

              <div>
                <span>소속</span>
                <strong>{profile.department}</strong>
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
                <strong className={profile.instagramId ? styles.instagram : ""}>
                  {instagramText}
                </strong>
              </div>
            </section>

            <section className={styles.bioCard}>
              <span>자기소개</span>
              <p>{bioText}</p>
            </section>
          </>
        )}
      </main>
    </MobileFrame>
  );
}