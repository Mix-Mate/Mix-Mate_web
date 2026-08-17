import clsx from "clsx";
import styles from "./InitialAvatar.module.css";

interface InitialAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export default function InitialAvatar({
  name,
  size = 50,
  className,
}: InitialAvatarProps) {
  return (
    <span
      className={clsx(styles.avatar, className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={`${name} 프로필 아바타`}
      role="img"
    >
      {name.slice(0, 1)}
    </span>
  );
}
