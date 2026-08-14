import styles from "./processing.module.css";

interface AssignmentProgressIndicatorProps {
  progress: number;
}

export default function AssignmentProgressIndicator({
  progress,
}: AssignmentProgressIndicatorProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.indicator}>
      <h2 className={styles.heading}>조를 편성하고 있어요</h2>

      <p className={styles.description}>
        선택한 조건을 반영해
        <br />
        최적의 배치를 계산 중입니다…
      </p>

      <div
        className={styles.track}
        role="progressbar"
        aria-label="조 편성 진행률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedProgress}
      >
        <div className={styles.fill} style={{ width: `${clampedProgress}%` }} />
      </div>
    </div>
  );
}
