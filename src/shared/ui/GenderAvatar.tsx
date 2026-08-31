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
  backgroundColor?: string;
}

const genderIconPaths: Record<GenderAvatarGender, string> = {
  male: "/icons/participant-male.svg",
  female: "/icons/participant-female.svg",
};

const avatarColors = ["#DBE6FF", "#C2D2F1", "#7C9EF8", "#829AE4", "#7C8DC1"];

function getAvatarToneIndex(name: string) {
  return Array.from(name).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  ) % avatarColors.length;
}

export default function GenderAvatar({
  gender,
  name,
  size = 50,
  shape = "rounded",
  className,
  backgroundColor,
}: GenderAvatarProps) {
  const iconSrc = genderIconPaths[gender];
  const toneIndex = getAvatarToneIndex(name);
  const avatarColor = backgroundColor ?? avatarColors[toneIndex];

  return (
    <span
      className={clsx(styles.avatar, styles[shape], className)}
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor,
      }}
      aria-label={name}
      role="img"
    >
      <Image
        src={iconSrc}
        alt=""
        width={size}
        height={size}
        className={clsx(styles.icon, styles[`tone${toneIndex}`])}
      />
    </span>
  );
}
