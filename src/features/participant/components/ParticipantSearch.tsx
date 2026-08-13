import SearchBar from "@/shared/ui/SearchBar";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ParticipantSearch({
  value,
  onChange,
}: ParticipantSearchProps) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder="이름 검색"
      className={styles.participantSearch}
    />
  );
}