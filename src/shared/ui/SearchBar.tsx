import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchBar({
  value,
  placeholder = "검색",
  onChange,
  className,
}: SearchBarProps) {
  return (
    <label className={[styles.searchBar, className].filter(Boolean).join(" ")}>
      <Search
        className={styles.searchIcon}
        aria-hidden="true"
        size={23}
        strokeWidth={2}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}