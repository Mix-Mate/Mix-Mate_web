import Image from "next/image";
import clsx from "clsx";
import styles from "./GenderAvatar.module.css";

export type GenderAvatarGender = "male" | "female";

interface GenderAvatarProps {
  gender: GenderAvatarGender;
  name: string;
  size?: number;
  className?: string;
}

export default function GenderAvatar({
  gender,
  name,
  size = 50,
  className,
}: GenderAvatarProps) {
  const iconSrc =
    gender === "female"
      ? "/icons/participant-female.svg"
      : "/icons/participant-male.svg";

  return (
    <span
      className={clsx(styles.avatar, className)}
      style={{ width: size, height: size }}
      aria-label={`${name} profile icon`}
      role="img"
    >
      <Image
        src={iconSrc}
        alt=""
        width={size}
        height={size}
        className={styles.icon}
      />
    </span>
  );
}
