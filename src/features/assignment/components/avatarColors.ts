const avatarColors = [
  "#3b82c4",
  "#6366f1",
  "#8b5cf6",
  "#71717a",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#a78bfa",
  "#f97316",
  "#0ea5e9",
  "#22c55e",
  "#eab308",
];

export function getAvatarColor(id: string) {
  const index = Array.from(id).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );

  return avatarColors[index % avatarColors.length];
}
