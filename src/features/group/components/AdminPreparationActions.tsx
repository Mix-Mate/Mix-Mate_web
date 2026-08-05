import { ArrowRight, UserRoundCog } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./admin-preparation.module.css";

interface SecondaryAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}

interface AdminPreparationActionsProps {
  onStartAssignment: () => void;
  secondaryAction: SecondaryAction;
  onEditProfile: () => void;
  footerPlacement?: "bottom" | "flow";
}

export default function AdminPreparationActions({
  onStartAssignment,
  secondaryAction,
  onEditProfile,
  footerPlacement = "bottom",
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

      <div
        className={`${styles.secondaryActions} ${
          footerPlacement === "flow" ? styles.flowActions : ""
        }`.trim()}
      >
        <button
          type="button"
          className={`${styles.secondaryButton} ${
            secondaryAction.tone === "danger" ? styles.deleteButton : ""
          }`.trim()}
          onClick={secondaryAction.onClick}
        >
          {secondaryAction.icon}
          {secondaryAction.label}
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
