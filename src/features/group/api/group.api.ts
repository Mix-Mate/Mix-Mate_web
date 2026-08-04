import { adminGroupPreparationMock } from "./group.mock";

export function getAdminGroupPreparation(groupId: string) {
  return {
    ...adminGroupPreparationMock,
    id: groupId,
  };
}

export async function deleteGroup(groupId: string) {
  void groupId;
  await new Promise((resolve) => window.setTimeout(resolve, 350));
}
