import InfoBanner from "@/shared/ui/InfoBanner";
import styles from "@/screens/common/ParticipantListScreen.module.css";

export default function ParticipantHelpBox() {
  return (
    <InfoBanner
      className={styles.participantNotice}
      aria-label="프로필 공개 범위 안내"
    >
      <p>
        전체 공개 프로필은 누구나 조회 가능합니다.
        <br />
        비공개 설정 시 이름·소속만 표시됩니다.
        <br />
        공개 프로필 탭 시 상세 정보를 확인할 수 있습니다.
      </p>
    </InfoBanner>
  );
}