import { describe, expect, it } from "vitest";
import type { RosterMember } from "../types/roster.types";
import {
  createParticipantRosterSheet,
  createTeamRosterSheet,
  sanitizeExcelFileBaseName,
} from "./roster-excel";

const members: RosterMember[] = [
  {
    studentId: "20260001",
    displayName: "김민준",
    major: "컴퓨터공학과",
    grade: "FIRST",
    gender: "MALE",
    teamNumber: 2,
  },
  {
    studentId: "20250002",
    displayName: "이서연",
    major: "경영학과",
    grade: "SECOND",
    gender: "FEMALE",
    teamNumber: 1,
  },
  {
    studentId: "20240003",
    displayName: "박다래",
    major: "컴퓨터공학과",
    grade: "THIRD",
    gender: "FEMALE",
    teamNumber: null,
  },
];

describe("roster-excel", () => {
  it("참가자 명단에 학번과 학년을 포함하고 표시값을 변환한다", () => {
    const sheet = createParticipantRosterSheet(members);

    expect(
      sheet[0].map((cell) =>
        typeof cell === "object" && cell !== null && "value" in cell
          ? cell.value
          : cell,
      ),
    ).toEqual(["학번", "이름", "학과", "학년", "성별"]);
    expect(sheet.slice(1)).toEqual([
      ["20260001", "김민준", "컴퓨터공학과", "1학년", "남성"],
      ["20250002", "이서연", "경영학과", "2학년", "여성"],
      ["20240003", "박다래", "컴퓨터공학과", "3학년", "여성"],
    ]);
  });

  it("조 번호순으로 정렬하고 미배정 인원은 마지막에 표시한다", () => {
    const sheet = createTeamRosterSheet(members);

    expect(
      sheet[0].map((cell) =>
        typeof cell === "object" && cell !== null && "value" in cell
          ? cell.value
          : cell,
      ),
    ).toEqual(["조번호", "학번", "이름", "학과", "학년", "성별"]);
    expect(sheet.slice(1)).toEqual([
      [1, "20250002", "이서연", "경영학과", "2학년", "여성"],
      [2, "20260001", "김민준", "컴퓨터공학과", "1학년", "남성"],
      ["-", "20240003", "박다래", "컴퓨터공학과", "3학년", "여성"],
    ]);
  });

  it("파일명에 사용할 수 없는 문자를 안전하게 치환한다", () => {
    expect(sanitizeExcelFileBaseName(' 동아리: A/B?* "테스트". ')).toBe(
      "동아리_ A_B_ _테스트_",
    );
    expect(sanitizeExcelFileBaseName("  ...  ")).toBe("MixMate");
  });
});

