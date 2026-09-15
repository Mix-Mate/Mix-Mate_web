export type MvpBadgeTier = 1 | 2 | 3 | 4 | 5;

export interface MvpBadgeTierInfo {
  tier: MvpBadgeTier;
  minCount: number;
  name: string;
}

export const MVP_BADGE_TIERS: readonly MvpBadgeTierInfo[] = [
  { tier: 1, minCount: 1, name: "브론즈" },
  { tier: 2, minCount: 3, name: "실버" },
  { tier: 3, minCount: 6, name: "골드" },
  { tier: 4, minCount: 9, name: "플래티넘" },
  { tier: 5, minCount: 12, name: "다이아" },
];

export function getMvpBadgeTier(
  mvpCount?: number | null,
): MvpBadgeTier | null {
  const count = mvpCount ?? 0;
  let current: MvpBadgeTier | null = null;

  for (const info of MVP_BADGE_TIERS) {
    if (count >= info.minCount) current = info.tier;
  }

  return current;
}

export function getMvpBadgeTierInfo(tier: MvpBadgeTier): MvpBadgeTierInfo {
  return MVP_BADGE_TIERS[tier - 1];
}
