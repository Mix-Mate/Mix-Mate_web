import styles from "./Avatar.module.css";

interface AvatarProps {
  name: string;
  fallback?: string;
  backgroundColor?: string;
  size?: number;
  shape?: "circle" | "rounded";
}

export default function Avatar({
  name,
  fallback,
  backgroundColor = "#94a3b8",
  size = 40,
  shape = "circle",
}: AvatarProps) {
  const fallbackText = fallback ?? name.trim().charAt(0);

  return (
    <span
      className={`${styles.avatar} ${styles[shape]}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: Math.max(10, Math.round(size * 0.39)),
      }}
      role="img"
      aria-label={`${name} 프로필 아바타`}
    >
      <span aria-hidden="true">{fallbackText}</span>
    </span>
  );
}
