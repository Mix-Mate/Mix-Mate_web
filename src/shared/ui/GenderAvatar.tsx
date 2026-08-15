import Image from "next/image";
import clsx from "clsx";
import type { Gender } from "@/shared/types/gender.types";
import styles from "./GenderAvatar.module.css";

export type GenderAvatarGender = Gender;
export type GenderAvatarShape = "circle" | "rounded";

interface GenderAvatarProps {
  gender: GenderAvatarGender;
  name: string;
  size?: number;
  shape?: GenderAvatarShape;
  className?: string;
}

const genderIconPaths: Record<GenderAvatarGender, string> = {
  male: "/icons/participant-male.svg",
  female: "/icons/participant-female.svg",
};

export default function GenderAvatar({
  gender,
  name,
  size = 50,
  shape = "rounded",
  className,
}: GenderAvatarProps) {
  const iconSrc = genderIconPaths[gender];

  return (
    <span
      className={clsx(styles.avatar, styles[shape], className)}
      style={{ width: size, height: size }}
      aria-label={`${name} 프로필 아바타`}
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
