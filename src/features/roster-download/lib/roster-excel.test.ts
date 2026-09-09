import { describe, expect, it } from "vitest";
import type { AssignmentTeam } from "@/features/assignment/types/assignment.types";
import type { Participant } from "@/features/participant/types/participant.types";
import {
  createParticipantRosterSheet,
  createTeamRosterSheet,
  sanitizeExcelFileBaseName,
} from "./roster-excel";

const participants: Participant[] = [
  {
    id: "1",
    name: "김민준",
    department: "컴퓨터공학과",
    gender: "male",
    role: "general",
    visibility: "public",
  },
  {
    id: "2",
    name: "이서연",
    department: "경영학과",
    gender: "female",
    role: "general",
    visibility: "public",
  },
];

describe("roster-excel", () => {
  it("참가자 명단 컬럼 순서와 성별 표시값을 변환한다", () => {
    const sheet = createParticipantRosterSheet(participants);

    expect(
      sheet[0].map((cell) =>
        typeof cell === "object" && cell !== null && "value" in cell
          ? cell.value
          : cell,
      ),
    ).toEqual(["이름", "학과", "성별"]);
    expect(sheet.slice(1)).toEqual([
      ["김민준", "컴퓨터공학과", "남성"],
      ["이서연", "경영학과", "여성"],
    ]);
  });

  it("모든 조의 멤버를 하나의 시트 데이터로 flatten한다", () => {
    const teams: AssignmentTeam[] = [
      {
        teamNumber: 1,
        members: [
          {
            participantId: 1,
            displayName: "김민준",
            major: "컴퓨터공학과",
            gender: "MALE",
            visibility: "PUBLIC",
            fixed: false,
          },
          {
            participantId: 2,
            displayName: "박다래",
            major: "컴퓨터공학과",
            gender: "FEMALE",
            visibility: "PUBLIC",
            fixed: false,
          },
        ],
      },
      {
        teamNumber: 2,
        members: [
          {
            participantId: 3,
            displayName: "이서연",
            major: "경영학과",
            gender: "FEMALE",
            visibility: "PUBLIC",
            fixed: false,
          },
        ],
      },
    ];

    const sheet = createTeamRosterSheet(teams);

    expect(
      sheet[0].map((cell) =>
        typeof cell === "object" && cell !== null && "value" in cell
          ? cell.value
          : cell,
      ),
    ).toEqual(["조번호", "이름", "학과"]);
    expect(sheet.slice(1)).toEqual([
      [1, "김민준", "컴퓨터공학과"],
      [1, "박다래", "컴퓨터공학과"],
      [2, "이서연", "경영학과"],
    ]);
  });

  it("파일명에 사용할 수 없는 문자를 안전하게 치환한다", () => {
    expect(sanitizeExcelFileBaseName(' 동아리: A/B?* "테스트". ')).toBe(
      "동아리_ A_B_ _테스트_",
    );
    expect(sanitizeExcelFileBaseName("  ...  ")).toBe("MixMate");
  });
});
