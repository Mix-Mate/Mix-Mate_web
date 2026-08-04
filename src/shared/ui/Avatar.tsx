"use client";

import { useState } from "react";
import styles from "./Avatar.module.css";

interface AvatarProps {
  name: string;
  src?: string | null;
  fallback?: string;
  backgroundColor?: string;
  size?: number;
  shape?: "circle" | "rounded";
}

export default function Avatar({
  name,
  src,
  fallback,
  backgroundColor = "#94a3b8",
  size = 40,
  shape = "circle",
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
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
      aria-label={`${name} 프로필 이미지`}
    >
      {showImage && src ? (
        // eslint-disable-next-line @next/next/no-img-element -- 백엔드가 전달하는 동적 프로필 URL을 그대로 지원한다.
        <img
          className={styles.image}
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-hidden="true">{fallbackText}</span>
      )}
    </span>
  );
}
