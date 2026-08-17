import type {
  AdminGroupPreparation,
  AdminRoundTwoPreparation,
} from "../types/group.types";

export const adminGroupPreparationMock: AdminGroupPreparation = {
  id: "demo",
  name: "2026 SW 동아리 MT",
  description: "SW 동아리 구성원들과 함께하는 네트워킹 모임",
  inviteCode: "SW2026",
  participantCount: 12,
  roleLabel: "관리자",
  statusLabel: "1차 준비 중",
};

export const adminRoundTwoPreparationMock: AdminRoundTwoPreparation = {
  id: "demo",
  name: "2026 SW 동아리 MT",
  description: "SW 동아리 구성원들과 함께하는 네트워킹 모임",
  participantCount: 8,
  roleLabel: "관리자",
  round: 2,
  statusLabel: "2차 준비 중",
};
