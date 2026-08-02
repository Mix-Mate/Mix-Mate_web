import { ChevronLeft } from "lucide-react";
import styles from "./Header.module.css";

interface HeaderProps {
  title: string;
  roleLabel: string;
  onBack: () => void;
  backLabel?: string;
}

export default function Header({
  title,
  roleLabel,
  onBack,
  backLabel = "이전 화면으로 이동",
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        aria-label={backLabel}
      >
        <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.7} />
      </button>
      <h1>{title}</h1>
      <span className={styles.roleBadge}>{roleLabel}</span>
    </header>
  );
}
