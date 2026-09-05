import { Search } from "lucide-react";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import type { Participant } from "../types/participant.types";
import ParticipantCard from "./ParticipantCard";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantListProps {
  participants: Participant[];
  round?: AssignmentRound;
  currentParticipantId?: string | null;
  onPrivateSelect?: (participant: Participant) => void;
  canViewPrivateProfiles?: boolean;
  detailFrom?: string;
}

export default function ParticipantList({
  participants,
  round,
  currentParticipantId,
  onPrivateSelect,
  canViewPrivateProfiles = false,
  detailFrom,
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Search aria-hidden="true" size={54} strokeWidth={1.8} />
        <p>검색 결과가 없습니다</p>
      </div>
    );
  }

  return (
    <ul className={styles.participantList}>
      {participants.map((participant) => (
        <ParticipantCard
          key={participant.id}
          participant={participant}
          round={round}
          currentParticipantId={currentParticipantId}
          onPrivateSelect={onPrivateSelect}
          canViewPrivateProfiles={canViewPrivateProfiles}
          detailFrom={detailFrom}
        />
      ))}
    </ul>
  );
}
