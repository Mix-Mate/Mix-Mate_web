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
  size = 50,
  shape = "circle",
  className,
  backgroundColor,
}: GenderAvatarProps) {
  const toneIndex = getAvatarToneIndex(String(toneKey ?? name));
  const avatarColor = backgroundColor ?? avatarColors[toneIndex];

  return (
    <span
      className={clsx(styles.avatar, styles[shape], className)}
      style={{
        width: size,
        height: size,
      }}
      aria-label={name}
      role="img"
    >
      <svg
        className={styles.icon}
        width={size}
        height={size}
        viewBox="0 0 62 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M8 26C8 13.2975 18.2975 3 31 3C43.7025 3 54 13.2975 54 26C54 38.7025 43.7025 49 31 49C18.2975 49 8 38.7025 8 26Z"
          fill={avatarColor}
          shapeRendering="crispEdges"
        />
        <path
          d="M31 27C33.7614 27 36 24.7614 36 22C36 19.2386 33.7614 17 31 17C28.2386 17 26 19.2386 26 22C26 24.7614 28.2386 27 31 27Z"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M39 35C39 32.8783 38.1571 30.8434 36.6569 29.3431C35.1566 27.8429 33.1217 27 31 27C28.8783 27 26.8434 27.8429 25.3431 29.3431C23.8429 30.8434 23 32.8783 23 35"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
