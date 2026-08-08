import { ChevronLeft } from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  title: string;
  roleLabel?: string;
  onBack: () => void;
  backLabel?: string;
  badgeTone?: "role" | "status" | "admin";
  compact?: boolean;
  smallTitle?: boolean;
}

export default function Header({
  title,
  roleLabel,
  onBack,
  backLabel = "이전 화면으로 이동",
  badgeTone = "role",
  compact = false,
  smallTitle = false,
}: HeaderProps) {
  return (
    <header
      className={`${styles.header} ${compact ? styles.compact : ""} ${
        smallTitle ? styles.smallTitle : ""
      }`.trim()}
    >
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        aria-label={backLabel}
      >
        <ChevronLeft aria-hidden="true" size={24} strokeWidth={1.7} />
      </button>
      <h1>{title}</h1>
      {roleLabel && (
        <span
          className={`${styles.roleBadge} ${
            badgeTone === "status" ? styles.statusBadge : ""
          } ${badgeTone === "admin" ? styles.adminBadge : ""}`.trim()}
        >
          {roleLabel}
        </span>
      )}
    </header>
  );
}
