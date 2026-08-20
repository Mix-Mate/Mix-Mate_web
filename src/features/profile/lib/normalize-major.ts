const majorAliases: Record<string, string> = {
  컴공: "컴퓨터공학전공",
  컴학: "컴퓨터공학전공",
  컴퓨터공학과: "컴퓨터공학전공",
  컴퓨터공학전공: "컴퓨터공학전공",
};

function compactMajor(value: string) {
  return value.replace(/\s+/g, "");
}

export function normalizeMajor(value: string) {
  const trimmedValue = value.trim();
  const compactValue = compactMajor(trimmedValue);

  return majorAliases[compactValue] ?? trimmedValue;
}
