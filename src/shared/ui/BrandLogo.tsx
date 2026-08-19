import clsx from "clsx";
import styles from "./BrandLogo.module.css";

// Traced from the design's raster logo; verified against it pixel-wise.
const STROKE_PATH =
  "M56.5 177 C56.7 173 56.8 160.3 57.5 153 C58.2 145.7 58.3 139.7 60.5 133 C62.7 126.3 66.6 117.4 70.5 113 C74.4 108.6 79.7 106.7 84 106.5 C88.3 106.3 92.6 107.8 96.5 112 C100.4 116.2 105 125.3 107.5 132 C110 138.7 109.8 145.3 111.5 152 C113.2 158.7 114.9 167.8 117.5 172 C120.1 176.2 123.8 177 127 177 C130.2 177 133.9 176.2 136.5 172 C139.1 167.8 140.8 158.7 142.5 152 C144.2 145.3 144 138.7 146.5 132 C149 125.3 153.6 116.2 157.5 112 C161.4 107.8 165.9 106.5 170 106.5 C174.1 106.5 178.1 107.6 182 112 C185.9 116.4 191.1 126.2 193.5 133 C195.9 139.8 195.8 145.7 196.5 153 C197.2 160.3 197.3 173 197.5 177";

interface BrandLogoProps {
  className?: string;
  size?: number;
  title?: string;
  animated?: boolean;
}

export default function BrandLogo({
  className,
  size = 255,
  title = "MixMate 로고",
  animated = false,
}: BrandLogoProps) {
  return (
    <svg
      className={clsx(styles.logo, animated && styles.animated, className)}
      width={size}
      height={size}
      viewBox="0 0 255 255"
      fill="none"
      role="img"
      aria-label={title}
    >
      <path
        className={styles.stroke}
        d={STROKE_PATH}
        stroke="currentColor"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <circle className={styles.head} cx={84} cy={83} r={11.5} fill="currentColor" />
      <circle className={styles.head} cx={170} cy={83} r={11.5} fill="currentColor" />
    </svg>
  );
}
