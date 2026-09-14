import { describe, expect, it } from "vitest";
import type { RosterMember } from "../types/roster.types";
import {
  createParticipantRosterSheet,
  createTeamRosterSheet,
  sanitizeExcelFileBaseName,
} from "./roster-excel";

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

function toValues(sheet: ReturnType<typeof createParticipantRosterSheet>) {
  return sheet.map((row) =>
    row.map((cell) =>
      typeof cell === "object" && cell !== null && "value" in cell
        ? cell.value
        : cell,
    ),
  );
}

describe("roster-excel", () => {
  it("참가자 명단 컬럼 순서(학번/이름/학과/성별)와 성별 표시값을 변환한다", () => {
    const sheet = createParticipantRosterSheet(members);
    const values = toValues(sheet);

    expect(values[0]).toEqual(["학번", "이름", "학과", "성별"]);
    expect(values.slice(1)).toEqual([
      ["20210001", "김민준", "컴퓨터공학과", "남성"],
      ["20220002", "이서연", "경영학과", "여성"],
    ]);
  });

  it("조 명단은 조번호 순으로 정렬되고 학번·성별을 포함한다", () => {
    const unordered: RosterMember[] = [
      { ...members[1], teamNumber: 2 },
      { ...members[0], teamNumber: 1 },
    ];
    const sheet = createTeamRosterSheet(unordered);
    const values = toValues(sheet);

    expect(values[0]).toEqual(["조번호", "학번", "이름", "학과", "성별"]);
    expect(values.slice(1)).toEqual([
      [1, "20210001", "김민준", "컴퓨터공학과", "남성"],
      [2, "20220002", "이서연", "경영학과", "여성"],
    ]);
  });

  it("파일명에 사용할 수 없는 문자를 안전하게 치환한다", () => {
    expect(sanitizeExcelFileBaseName(' 동아리: A/B?* "테스트". ')).toBe(
      "동아리_ A_B_ _테스트_",
    );
    expect(sanitizeExcelFileBaseName("  ...  ")).toBe("MixMate");
  });
});
