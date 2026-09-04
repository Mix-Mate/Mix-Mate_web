import type { CSSProperties } from "react";
import clsx from "clsx";
import type { Gender } from "@/shared/types/gender.types";
import styles from "./GenderAvatar.module.css";

export type GenderAvatarGender = Gender;
export type GenderAvatarShape = "circle" | "rounded";

interface GenderAvatarProps {
  gender: GenderAvatarGender;
  name: string;
  toneKey?: string | number;
  size?: number;
  shape?: GenderAvatarShape;
  className?: string;
  backgroundColor?: string;
}

const avatarColors = ["#5B8DEF", "#2F6BFF", "#1F5AF6", "#1642C8", "#0F2E8F"];

function getAvatarToneIndex(name: string) {
  return Array.from(name).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  ) % avatarColors.length;
}

export default function GenderAvatar({
  name,
  toneKey,
  size = 46,
  shape = "circle",
  className,
  backgroundColor,
}: GenderAvatarProps) {
  const toneIndex = getAvatarToneIndex(String(toneKey ?? name));
  const avatarColor = backgroundColor ?? avatarColors[toneIndex];
  const iconSize = (size * 24) / 46;

  return (
    <span
      className={clsx(styles.avatar, styles[shape], className)}
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor,
        "--avatar-icon-size": `${iconSize}px`,
      } as CSSProperties}
      aria-label={name}
      role="img"
    >
      <svg
        className={styles.icon}
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 22C20 19.8783 19.1571 17.8434 17.6569 16.3431C16.1566 14.8429 14.1217 14 12 14C9.87827 14 7.84344 14.8429 6.34315 16.3431C4.84285 17.8434 4 19.8783 4 22"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
