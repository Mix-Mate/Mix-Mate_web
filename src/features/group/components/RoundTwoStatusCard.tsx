import { SquarePen } from "lucide-react";
import SessionStatusCard from "@/features/session/components/SessionStatusCard";

interface RoundTwoStatusCardProps {
  eyebrow: string;
  statusLabel: string;
  onEditGroup?: () => void;
  showEditButton?: boolean;
}

export default function RoundTwoStatusCard({
  eyebrow,
  statusLabel,
  onEditGroup,
  showEditButton = true,
}: RoundTwoStatusCardProps) {
  const action =
    showEditButton && onEditGroup
      ? {
          ariaLabel: "그룹 정보 편집",
          icon: <SquarePen aria-hidden="true" size={18} strokeWidth={2} />,
          onClick: onEditGroup,
        }
      : undefined;

  return (
    <SessionStatusCard eyebrow={eyebrow} status={statusLabel} action={action} />
  );
}
