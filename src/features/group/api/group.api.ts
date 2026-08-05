import type { UpdateGroupInput } from "../types/group.types";
import {
  adminGroupPreparationMock,
  adminRoundTwoPreparationMock,
} from "./group.mock";

export function getAdminGroupPreparation(groupId: string) {
  return {
    ...adminGroupPreparationMock,
    id: groupId,
  };
}

export function getAdminRoundTwoPreparation(groupId: string) {
  return {
    ...adminRoundTwoPreparationMock,
    id: groupId,
  };
}

export async function updateGroup(groupId: string, input: UpdateGroupInput) {
  await new Promise((resolve) => setTimeout(resolve, 450));

  return {
    id: groupId,
    ...input,
  };
}

export async function deleteGroup(groupId: string) {
  void groupId;
  await new Promise((resolve) => setTimeout(resolve, 350));
}
