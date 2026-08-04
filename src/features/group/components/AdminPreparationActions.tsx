import { ArrowRight, Trash2, UserRoundCog } from "lucide-react";
import styles from "./admin-preparation.module.css";

interface AdminPreparationActionsProps {
  onStartAssignment: () => void;
  onRequestDelete: () => void;
  onEditProfile: () => void;
}

export default function AdminPreparationActions({
  onStartAssignment,
  onRequestDelete,
  onEditProfile,
}: AdminPreparationActionsProps) {
  return (
    <>
      <button
        type="button"
        className={styles.assignmentButton}
        onClick={onStartAssignment}
      >
        <span>관리자전용</span>
        <strong>
          조 편성하기
          <ArrowRight aria-hidden="true" size={26} strokeWidth={2.2} />
        </strong>
      </button>

      <div className={styles.secondaryActions}>
        <button
          type="button"
          className={`${styles.secondaryButton} ${styles.deleteButton}`}
          onClick={onRequestDelete}
        >
          <Trash2 aria-hidden="true" size={20} strokeWidth={1.8} />
          그룹 삭제하기
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onEditProfile}
        >
          <UserRoundCog aria-hidden="true" size={17} strokeWidth={1.8} />내
          프로필 수정
        </button>
      </div>
    </>
  );
}
