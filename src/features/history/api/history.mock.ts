import type { MyTeamData } from "@/features/team/types/team.types";

export const previousTeamMock: MyTeamData = {
  teamNumber: 1,
  members: [
    {
      id: "lee-seoyeon",
      name: "이서연",
      department: "컴퓨터공학과",
      gender: "female",
      avatarInitial: "이",
      avatarColor: "#6366f1",
      profileVisibility: "PUBLIC",
    },
    {
      id: "jung-hyeonwoo",
      name: "정현우",
      department: "전기공학과",
      gender: "male",
      avatarInitial: "정",
      avatarColor: "#71717a",
      profileVisibility: "PUBLIC",
    },
    {
      id: "han-sohee",
      name: "한소희",
      department: "산업디자인과",
      gender: "female",
      avatarInitial: "한",
      avatarColor: "#8b5cf6",
      profileVisibility: "PUBLIC",
    },
  ],
};
