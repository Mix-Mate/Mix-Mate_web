import type { MvpCandidate } from "../../types/mvpVote.types";
import styles from "../vote.module.css";
import MvpCandidateItem from "./MvpCandidateItem";

interface MvpCandidateListProps {
  candidates: MvpCandidate[];
  selectedParticipantId: number | null;
  disabled: boolean;
  onSelect: (participantId: number) => void;
}

export default function MvpCandidateList({
  candidates,
  selectedParticipantId,
  disabled,
  onSelect,
}: MvpCandidateListProps) {
  return (
    <fieldset className={styles.candidateList} disabled={disabled}>
      <legend className={styles.visuallyHidden}>MVP 후보 한 명 선택</legend>
      {candidates.map((candidate) => (
        <MvpCandidateItem
          key={candidate.participantId}
          candidate={candidate}
          selected={candidate.participantId === selectedParticipantId}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </fieldset>
  );
}
