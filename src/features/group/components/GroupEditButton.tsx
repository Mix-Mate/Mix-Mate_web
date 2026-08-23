import { ChevronRight, Paperclip } from "lucide-react";
import styles from "./group-edit-button.module.css";

interface GroupEditButtonProps {
  onClick: () => void;
}

export default function GroupEditButton({ onClick }: GroupEditButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <span className={styles.icon} aria-hidden="true">
        <Paperclip size={19} strokeWidth={1.8} />
      </span>
      <span className={styles.text}>
        <strong>그룹 정보 편집</strong>
        <small>이름 · 설명 수정</small>
      </span>
      <ChevronRight
        className={styles.chevron}
        aria-hidden="true"
        size={18}
        strokeWidth={2}
      />
    </button>
  );
}
