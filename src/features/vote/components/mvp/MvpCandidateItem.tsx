import GenderAvatar from "@/shared/ui/GenderAvatar";
import type { MvpCandidate } from "../../types/mvpVote.types";
import styles from "../vote.module.css";

interface MvpCandidateItemProps {
  candidate: MvpCandidate;
  selected: boolean;
  disabled: boolean;
  onSelect: (participantId: number) => void;
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
        value={candidate.participantId}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(candidate.participantId)}
      />
      <GenderAvatar
        gender={candidate.gender}
        name={candidate.name}
        size={44}
        shape="circle"
      />
      <span className={styles.candidateText}>
        <strong title={candidate.name}>{candidate.name}</strong>
        <small>{candidate.department}</small>
      </span>
      <span className={styles.radioMark} aria-hidden="true">
        {selected && <span />}
      </span>
    </label>
  );
}
