"use client";

import { LockKeyhole } from "lucide-react";
import type { Participant } from "../types/participant.types";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface PrivateParticipantDialogProps {
  participant: Participant | null;
  onClose: () => void;
}

export default function PrivateParticipantDialog({
  participant,
  onClose,
}: PrivateParticipantDialogProps) {
  return (
    <BottomSheetDialog
      open={participant !== null}
      titleId="private-profile-title"
      sheetClassName={styles.privateProfileSheet}
      onClose={onClose}
    >
      {participant && (
        <div className={styles.privateProfileContent}>
          <GenderAvatar
            gender={participant.gender}
            name={participant.name}
            toneKey={participant.id}
            size={72}
          />
          <h2>{participant.name}</h2>
          <p>{participant.department}</p>

          <div className={styles.privateProfileDivider} />

          <section className={styles.privateProfileNotice}>
            <LockKeyhole aria-hidden="true" size={34} />
            <strong id="private-profile-title">비공개 프로필입니다</strong>
            <span>
              해당 참가자의 상세 프로필
              <br />
              정보는 확인할 수 없습니다.
            </span>
          </section>

          <Button onClick={onClose}>닫기</Button>
        </div>
      )}
    </BottomSheetDialog>
  );
}
