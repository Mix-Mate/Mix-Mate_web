import Button from "@/shared/ui/Button";
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
    <Button
      className={styles.adminEndButton}
      disabled={disabled}
      onClick={onEnd}
    >
      전체 투표 종료하기
    </Button>
  );
}
