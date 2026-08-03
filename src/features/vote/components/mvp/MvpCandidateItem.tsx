import Avatar from "@/shared/ui/Avatar";
import type { MvpCandidate } from "../../types/vote.types";
import styles from "../vote.module.css";

interface MvpCandidateItemProps {
  candidate: MvpCandidate;
  selected: boolean;
  disabled: boolean;
  onSelect: (candidateId: string) => void;
}

export default function MvpCandidateItem({
  candidate,
  selected,
  disabled,
  onSelect,
}: MvpCandidateItemProps) {
  return (
    <label
      className={`${styles.candidateItem} ${
        selected ? styles.selectedCandidate : ""
      }`}
    >
      <input
        className={styles.visuallyHidden}
        type="radio"
        name="mvp-candidate"
        value={candidate.id}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(candidate.id)}
      />
      <Avatar
        name={candidate.name}
        src={candidate.profileImage}
        fallback={candidate.avatarInitial}
        backgroundColor={candidate.avatarColor}
        size={44}
      />
      <span className={styles.candidateText}>
        <strong>{candidate.name}</strong>
        <small>{candidate.department}</small>
      </span>
      <span className={styles.radioMark} aria-hidden="true">
        {selected && <span />}
      </span>
    </label>
  );
}
