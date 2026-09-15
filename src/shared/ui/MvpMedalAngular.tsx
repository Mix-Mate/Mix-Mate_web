import type { MvpBadgeTier } from "@/shared/lib/mvp-badge";

interface MvpMedalAngularProps {
  tier: MvpBadgeTier;
  size?: number;
  className?: string;
}

const VIEW_WIDTH = 40;
const VIEW_HEIGHT = 52;

const TIER_PALETTE: Record<
  MvpBadgeTier,
  {
    light: string;
    base: string;
    dark: string;
    rim: string;
    ribbon: string;
    ribbonStripe: string;
    mark: string;
    glow: string;
  }
> = {
  1: {
    light: "#9C6A4A",
    base: "#6B4632",
    dark: "#3E2618",
    rim: "#B07A56",
    ribbon: "#6E3A1E",
    ribbonStripe: "#8A4A26",
    mark: "#E8B597",
    glow: "rgba(176, 122, 86, 0.45)",
  },
  2: {
    light: "#F2F5F9",
    base: "#C9D1DC",
    dark: "#8E99A8",
    rim: "#FFFFFF",
    ribbon: "#1E2732",
    ribbonStripe: "#2C3847",
    mark: "#FFFFFF",
    glow: "rgba(142, 153, 168, 0.5)",
  },
  3: {
    light: "#FFE070",
    base: "#F2B928",
    dark: "#B8860B",
    rim: "#FFF1A8",
    ribbon: "#7A1C22",
    ribbonStripe: "#A32830",
    mark: "#FFFFFF",
    glow: "rgba(242, 185, 40, 0.6)",
  },
  4: {
    light: "#7FE8FF",
    base: "#1EB8DC",
    dark: "#0D7C99",
    rim: "#B8F3FF",
    ribbon: "#0F6F87",
    ribbonStripe: "#1795B3",
    mark: "#FFFFFF",
    glow: "rgba(30, 184, 220, 0.65)",
  },
  5: {
    light: "#C89BFF",
    base: "#8B3FE8",
    dark: "#5A1FB0",
    rim: "#E4CCFF",
    ribbon: "#3D1785",
    ribbonStripe: "#5E2BC2",
    mark: "#FFFFFF",
    glow: "rgba(139, 63, 232, 0.7)",
  },
};

const HEXAGON = "20,17 33.86,25 33.86,41 20,49 6.14,41 6.14,25";
const INNER_HEXAGON = "20,21 30.39,27 30.39,39 20,45 9.61,39 9.61,27";
const OCTAGON =
  "34.78,39.12 26.12,47.78 13.88,47.78 5.22,39.12 5.22,26.88 13.88,18.22 26.12,18.22 34.78,26.88";

export default function MvpMedalAngular({
  tier,
  size = 52,
  className,
}: MvpMedalAngularProps) {
  const palette = TIER_PALETTE[tier];
  const gradientId = `mvpAngularFill${tier}`;
  const fill = `url(#${gradientId})`;

  return (
    <svg
      className={className}
      width={(size * VIEW_WIDTH) / VIEW_HEIGHT}
      height={size}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label="MVP 메달"
      style={{ filter: `drop-shadow(0 0 6px ${palette.glow})` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={palette.light} />
          <stop offset="50%" stopColor={palette.base} />
          <stop offset="100%" stopColor={palette.dark} />
        </linearGradient>
      </defs>

      <rect x="13" y="0" width="14" height="16" fill={palette.ribbon} />
      <rect x="17.5" y="0" width="5" height="16" fill={palette.ribbonStripe} />

      {tier <= 2 && (
        <circle
          cx="20"
          cy="33"
          r="15"
          fill={fill}
          stroke={palette.rim}
          strokeWidth="1.5"
        />
      )}
      {tier === 2 && (
        <circle
          cx="20"
          cy="33"
          r="11.5"
          fill="none"
          stroke={palette.rim}
          strokeOpacity="0.7"
          strokeWidth="1"
        />
      )}
      {(tier === 3 || tier === 5) && (
        <polygon
          points={HEXAGON}
          fill={fill}
          stroke={palette.rim}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      {tier === 5 && (
        <polygon
          points={INNER_HEXAGON}
          fill="none"
          stroke={palette.rim}
          strokeOpacity="0.75"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      )}
      {tier === 4 && (
        <polygon
          points={OCTAGON}
          fill={fill}
          stroke={palette.rim}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      {tier === 5 && (
        <path
          d="M33 19 L34 22 L37 23 L34 24 L33 27 L32 24 L29 23 L32 22 Z"
          fill="#FFFFFF"
        />
      )}

      <path
        d="M14.2 38.6 C14.2 35.4 14.6 33 16 33 C17.4 33 18.1 36.2 20 36.2 C21.9 36.2 22.6 33 24 33 C25.4 33 25.8 35.4 25.8 38.6"
        fill="none"
        stroke={palette.mark}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="29.4" r="1.4" fill={palette.mark} />
      <circle cx="24" cy="29.4" r="1.4" fill={palette.mark} />
    </svg>
  );
}
