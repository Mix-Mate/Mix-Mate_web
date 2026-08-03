import styles from "./VoteStatus.module.css";

interface AdminVoteEndButtonProps {
  disabled?: boolean;
  onEnd: () => void;
}

export default function AdminVoteEndButton({
  disabled = false,
  onEnd,
}: AdminVoteEndButtonProps) {
  return (
    <button
      type="button"
      className={styles.adminEndButton}
      disabled={disabled}
      onClick={onEnd}
    >
      투표 종료하기
    </button>
  );
}
