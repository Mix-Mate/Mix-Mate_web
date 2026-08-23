import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  title: string;
  statusLabel?: string;
  onBack: () => void;
  backLabel?: string;
  compact?: boolean;
  smallTitle?: boolean;
  rightAction?: ReactNode;
}

export default function Header({
  title,
  statusLabel,
  onBack,
  backLabel = "이전 화면으로 이동",
  compact = false,
  smallTitle = false,
  rightAction,
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
      {rightAction ??
        (statusLabel && (
          <span className={styles.statusBadge}>{statusLabel}</span>
        ))}
    </header>
  );
}
