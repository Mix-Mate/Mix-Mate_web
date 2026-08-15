import type { MyTeamData, TeamMemberSummary } from "../types/team.types";

const members: Record<string, TeamMemberSummary> = {
  minjun: {
    id: "kim-minjun",
    name: "김민준",
    department: "컴퓨터공학과",
    gender: "male",
    profileVisibility: "PRIVATE",
  },
  seoyeon: {
    id: "lee-seoyeon",
    name: "이서연",
    department: "정보통신공학과",
    gender: "female",
    profileVisibility: "PUBLIC",
  },
  jiho: {
    id: "park-jiho",
    name: "박지호",
    department: "전기전자공학과",
    gender: "male",
    profileVisibility: "PUBLIC",
  },
  sua: {
    id: "choi-sua",
    name: "최수아",
    department: "산업디자인학과",
    gender: "female",
    profileVisibility: "PUBLIC",
  },
};

export const myTeamMock: MyTeamData = {
  teamNumber: 3,
  members: [members.minjun, members.seoyeon, members.jiho, members.sua],
};
