import {
  getSavedMyGroupProfile,
  MY_PARTICIPANT_ID,
} from "@/features/profile/lib/profile-storage";
import type {
  Participant,
  ParticipantGroup,
  ParticipantProfile,
} from "../types/participant.types";

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
    name: "한소희",
    department: "산업공학과",
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

const participantProfileMocks: ParticipantProfile[] = [
  {
    id: "2",
    name: "박지호",
    department: "전기공학과",
    visibility: "private",
    role: "general",
    gender: "male",
    grade: "2학년",
    mbti: "ISTJ",
    age: 22,
    instagramId: "@park.jiho",
    bio: "전기공학과 박지호입니다.",
    isNew: false,
  },
  {
    id: "3",
    name: "최수아",
    department: "산업디자인",
    visibility: "public",
    role: "staff",
    gender: "female",
    grade: "1학년",
    mbti: "INFP",
    age: 21,
    instagramId: "@choi.sua",
    bio: "안녕하세요! 디자인 좋아하는 1학년입니다 😊",
    isNew: true,
  },
  {
    id: "5",
    name: "한지우",
    department: "전자공학과",
    visibility: "public",
    role: "general",
    gender: "female",
    grade: "2학년",
    mbti: "ENFJ",
    age: 22,
    instagramId: "@han.jiwoo",
    bio: "처음 뵙겠습니다!",
    isNew: true,
  },
  {
    id: "8",
    name: "윤재원",
    department: "수학과",
    visibility: "public",
    role: "general",
    gender: "male",
    grade: "4학년",
    mbti: "ENTP",
    age: 25,
    instagramId: "@yoon.jaewon",
    bio: "수학과 윤재원입니다.",
    isNew: false,
  },
  {
    id: "10",
    name: "조현준",
    department: "화학공학과",
    visibility: "public",
    role: "general",
    gender: "male",
    grade: "3학년",
    mbti: "ISTP",
    age: 24,
    instagramId: "@jo.hyeonjun",
    isNew: false,
  },
  {
    id: "11",
    name: "한소희",
    department: "산업공학과",
    visibility: "public",
    role: "general",
    gender: "female",
    grade: "2학년",
    mbti: "ENFJ",
    age: 23,
    bio: "안녕하세요! 데이터 좋아하는 1학년입니다 😊",
    isNew: true,
  },
  {
    id: "lee-seoyeon",
    name: "이서연",
    department: "정보통신공학과",
    visibility: "public",
    role: "general",
    gender: "female",
    grade: "1학년",
    mbti: "INFP",
    age: 21,
    instagramId: "@lee.seoyeon",
    bio: "안녕하세요! 데이터 좋아하는 1학년입니다 😊",
    isNew: true,
  },
  {
    id: "park-jiho",
    name: "박지호",
    department: "전기전자공학과",
    visibility: "public",
    role: "general",
    gender: "male",
    grade: "2학년",
    mbti: "ISTJ",
    age: 22,
    instagramId: "@park.jiho",
    bio: "전기전자공학과 박지호입니다.",
    isNew: false,
  },
  {
    id: "choi-sua",
    name: "최수아",
    department: "산업디자인학과",
    visibility: "public",
    role: "general",
    gender: "female",
    grade: "3학년",
    mbti: "ISFP",
    age: 23,
    instagramId: "@choi.sua",
    bio: "산업디자인학과 최수아입니다.",
    isNew: false,
  },
];

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

function getMyParticipantProfile(): ParticipantProfile {
  const myProfile = getSavedMyGroupProfile();

  return {
    id: MY_PARTICIPANT_ID,
    name: myProfile.displayName,
    department: myProfile.major,
    visibility: myProfile.visibility === "PUBLIC" ? "public" : "private",
    role: myProfile.position === "STAFF" ? "staff" : "general",
    gender: myProfile.gender === "MALE" ? "male" : "female",
    grade: "3학년",
    mbti: myProfile.mbti,
    age: myProfile.age ?? undefined,
    instagramId: myProfile.instaId ?? undefined,
    bio: myProfile.bio ?? undefined,
    isNew: myProfile.isNew,
  };
}

function getDefaultParticipantProfile(participantId: string): ParticipantProfile {
  const participant =
    participants.find((item) => item.id === participantId) ?? participants[0];

  return {
    ...participant,
    grade: "1학년",
    mbti: "ISTP",
    age: 21,
    instagramId: "@mixmate",
    bio: "안녕하세요!",
    isNew: true,
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

export function getParticipantProfileMock(participantId: string) {
  if (participantId === MY_PARTICIPANT_ID) {
    return getMyParticipantProfile();
  }

  const profile = participantProfileMocks.find(
    (participant) => participant.id === participantId,
  );

  return profile ?? getDefaultParticipantProfile(participantId);
}
