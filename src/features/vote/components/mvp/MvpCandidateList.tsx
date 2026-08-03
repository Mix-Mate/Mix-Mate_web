import type { MvpCandidate } from "../../types/vote.types";
import styles from "../vote.module.css";
import MvpCandidateItem from "./MvpCandidateItem";

interface MvpCandidateListProps {
  candidates: MvpCandidate[];
  selectedCandidateId: string | null;
  disabled: boolean;
  onSelect: (candidateId: string) => void;
}

export default function MvpCandidateList({
  candidates,
  selectedCandidateId,
  disabled,
  onSelect,
}: MvpCandidateListProps) {
  return (
    <fieldset className={styles.candidateList} disabled={disabled}>
      <legend className={styles.visuallyHidden}>MVP 후보 한 명 선택</legend>
      {candidates.map((candidate) => (
        <MvpCandidateItem
          key={candidate.id}
          candidate={candidate}
          selected={candidate.id === selectedCandidateId}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </fieldset>
  );
}
