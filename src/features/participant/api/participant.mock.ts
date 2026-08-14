import {
  getSavedMyGroupProfile,
  MY_PARTICIPANT_ID,
} from "@/features/profile/lib/profile-storage";
import type { Participant, ParticipantGroup } from "../types/participant.types";

const participants: Participant[] = [
  {
    id: "1",
    name: "김민준",
    department: "컴퓨터공학과",
    visibility: "public",
    role: "general",
    gender: "male",
  },
  {
    id: "2",
    name: "박지호",
    department: "전기공학과",
    visibility: "private",
    role: "general",
    gender: "male",
  },
  {
    id: "3",
    name: "최수아",
    department: "산업디자인",
    visibility: "public",
    role: "staff",
    gender: "female",
  },
  {
    id: "4",
    name: "정다은",
    department: "경영학과",
    visibility: "private",
    role: "general",
    gender: "female",
  },
  {
    id: "5",
    name: "한지우",
    department: "전자공학과",
    visibility: "public",
    role: "general",
    gender: "female",
  },
  {
    id: "6",
    name: "오승현",
    department: "기계공학과",
    visibility: "public",
    role: "staff",
    gender: "male",
  },
  {
    id: "7",
    name: "강민서",
    department: "심리학과",
    visibility: "private",
    role: "general",
    gender: "female",
  },
  {
    id: "8",
    name: "윤재원",
    department: "수학과",
    visibility: "public",
    role: "general",
    gender: "male",
  },
  {
    id: "9",
    name: "신예린",
    department: "영문학과",
    visibility: "private",
    role: "staff",
    gender: "female",
  },
  {
    id: "10",
    name: "조현준",
    department: "화학공학과",
    visibility: "public",
    role: "general",
    gender: "male",
  },
  {
    id: "11",
    name: "임수진",
    department: "건축학과",
    visibility: "public",
    role: "general",
    gender: "female",
  },
  {
    id: "12",
    name: "김도윤",
    department: "체육교육과",
    visibility: "private",
    role: "general",
    gender: "male",
  },
];

const getMembers = (ids: string[]) =>
  participants.filter((participant) => ids.includes(participant.id));

export const participantGroupMock: ParticipantGroup = {
  groupName: "2026 SW 동아리 MT",
  participants,
  teams: [
    {
      teamNumber: 1,
      members: getMembers(["1", "2", "3", "4"]),
    },
    {
      teamNumber: 2,
      members: getMembers(["5", "6", "7", "8"]),
    },
    {
      teamNumber: 3,
      members: getMembers(["9", "10", "11", "12"]),
    },
  ],
};

function applyMyProfile(participant: Participant): Participant {
  if (participant.id !== MY_PARTICIPANT_ID) {
    return participant;
  }

  const myProfile = getSavedMyGroupProfile();

  return {
    ...participant,
    name: myProfile.displayName,
    department: myProfile.major,
    visibility: myProfile.visibility === "PUBLIC" ? "public" : "private",
    gender: myProfile.gender === "MALE" ? "male" : "female",
  };
}

export function getParticipantListMock() {
  return {
    ...participantGroupMock,
    participants: participantGroupMock.participants.map(applyMyProfile),
    teams: participantGroupMock.teams.map((team) => ({
      ...team,
      members: team.members.map(applyMyProfile),
    })),
  };
}
