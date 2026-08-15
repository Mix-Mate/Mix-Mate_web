import { CircleCheck, CircleX } from "lucide-react";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import type { VoteStatusMember } from "../../types/vote.types";
import styles from "./VoteStatus.module.css";

interface VoteStatusItemProps {
  member: VoteStatusMember;
}

export default function VoteStatusItem({ member }: VoteStatusItemProps) {
  return (
    <li className={styles.statusItem}>
      <GenderAvatar
        gender={member.gender}
        name={member.memberName}
        size={28}
        shape="circle"
      />
      <strong>{member.memberName}</strong>
      {member.attendanceStatus === "PENDING" && (
        <span className={styles.waitingBadge}>대기 중</span>
      )}
      {member.attendanceStatus === "ATTEND" && (
        <CircleCheck
          className={styles.attendanceIcon}
          aria-label="2차 참여"
          size={18}
          strokeWidth={2}
        />
      )}
      {member.attendanceStatus === "ABSENT" && (
        <CircleX
          className={styles.absenceIcon}
          aria-label="불참"
          size={18}
          strokeWidth={2}
        />
      )}
    </li>
  );
}
