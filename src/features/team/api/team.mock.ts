import type { MyTeamData, TeamMemberSummary } from "../types/team.types";

const members: Record<string, TeamMemberSummary> = {
  minjun: {
    id: "kim-minjun",
    name: "김민준",
    department: "컴퓨터공학과",
    gender: "male",
    avatarInitial: "김",
    avatarColor: "#2f80d1",
    profileVisibility: "PRIVATE",
  },
  seoyeon: {
    id: "lee-seoyeon",
    name: "이서연",
    department: "정보통신공학과",
    gender: "female",
    avatarInitial: "이",
    avatarColor: "#7c3aed",
    profileVisibility: "PUBLIC",
  },
  jiho: {
    id: "park-jiho",
    name: "박지호",
    department: "전기전자공학과",
    gender: "male",
    avatarInitial: "박",
    avatarColor: "#7357e8",
    profileVisibility: "PUBLIC",
  },
  sua: {
    id: "choi-sua",
    name: "최수아",
    department: "산업디자인학과",
    gender: "female",
    avatarInitial: "최",
    avatarColor: "#777b82",
    profileVisibility: "PUBLIC",
  },
};

export const myTeamMock: MyTeamData = {
  teamNumber: 3,
  members: [members.minjun, members.seoyeon, members.jiho, members.sua],
};
