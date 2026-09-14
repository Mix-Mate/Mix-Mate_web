import { describe, expect, it } from "vitest";
import type { RosterMember } from "../types/roster.types";
import { createRosterSheet, sanitizeExcelFileBaseName } from "./roster-excel";

const members: RosterMember[] = [
  {
    studentId: "20210001",
    displayName: "김민준",
    major: "컴퓨터공학과",
    grade: "SECOND",
    gender: "MALE",
    teamNumber: 1,
  },
  {
    studentId: "20220002",
    displayName: "이서연",
    major: "경영학과",
    grade: "FIRST",
    gender: "FEMALE",
    teamNumber: 2,
  },
];

function toValues(sheet: ReturnType<typeof createRosterSheet>) {
  return sheet.map((row) =>
    row.map((cell) =>
      typeof cell === "object" && cell !== null && "value" in cell
        ? cell.value
        : cell,
    ),
  );
}

describe("roster-excel", () => {
  it("명단은 조번호를 가장 앞에 두고 조번호 순으로 정렬된다", () => {
    const unordered: RosterMember[] = [
      { ...members[1], teamNumber: 2 },
      { ...members[0], teamNumber: 1 },
    ];
    const sheet = createRosterSheet(unordered);
    const values = toValues(sheet);

    expect(values[0]).toEqual(["조번호", "학번", "이름", "학과", "성별"]);
    expect(values.slice(1)).toEqual([
      [1, "20210001", "김민준", "컴퓨터공학과", "남성"],
      [2, "20220002", "이서연", "경영학과", "여성"],
    ]);
  });

  it("조가 배정되지 않은 참가자는 조번호를 빈 값으로 표시하고 목록의 뒤로 정렬한다", () => {
    const noTeam: RosterMember = { ...members[0], teamNumber: null };
    const sheet = createRosterSheet([noTeam, { ...members[1], teamNumber: 1 }]);
    const values = toValues(sheet);

    expect(values.slice(1)).toEqual([
      [1, "20220002", "이서연", "경영학과", "여성"],
      ["", "20210001", "김민준", "컴퓨터공학과", "남성"],
    ]);
  });

  it("파일명에 사용할 수 없는 문자를 안전하게 치환한다", () => {
    expect(sanitizeExcelFileBaseName(' 동아리: A/B?* "테스트". ')).toBe(
      "동아리_ A_B_ _테스트_",
    );
    expect(sanitizeExcelFileBaseName("  ...  ")).toBe("MixMate");
  });
});
