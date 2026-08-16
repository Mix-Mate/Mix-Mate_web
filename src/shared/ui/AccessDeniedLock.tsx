import { LockKeyhole } from "lucide-react";

interface AccessDeniedLockProps {
  className?: string;
}

export default function AccessDeniedLock({
  className,
}: AccessDeniedLockProps) {
  return (
    <LockKeyhole
      aria-hidden="true"
      className={className}
      size={60}
      strokeWidth={1.4}
    />
  );
}
