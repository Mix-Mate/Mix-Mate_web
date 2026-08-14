import type { MyGroupProfile } from "../types/profile.types";

export const myGroupProfileMock: MyGroupProfile = {
  id: "1",
  displayName: "김민준",
  position: "MEMBER",
  major: "컴퓨터공학과",
  isNew: true,
  grade: "THIRD",
  gender: "MALE",
  mbti: "ISTP",
  age: 24,
  instaId: "@minjun_k",
  bio: "반갑습니다 :)",
  visibility: "PUBLIC",
};

export function getMyGroupProfileMock() {
  return myGroupProfileMock;
}
