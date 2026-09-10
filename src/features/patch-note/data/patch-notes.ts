export type PatchNoteType =
  | "New"
  | "Changed"
  | "Fixed"
  | "Improved"
  | "Security"
  | "Deprecated"
  | "Removed";

export const PATCH_NOTE_TYPE_LABEL: Record<PatchNoteType, string> = {
  New: "새로운 기능 추가",
  Changed: "기존 기능 또는 동작 변경",
  Fixed: "버그 및 오류 수정",
  Improved: "성능 또는 사용성 개선",
  Security: "보안 및 안정성 관련 수정",
  Deprecated: "지원 종료 예정",
  Removed: "기능 제거",
};

export interface PatchNoteChange {
  type: PatchNoteType;
  title: string;
  description: string;
  details?: string[];
}

export interface PatchNoteItem {
  id: string;
  version: `v.${number}.${number}.${number}`;
  title: string;
  summary: string;
  date: string;
  changes: PatchNoteChange[];
}

export const PATCH_NOTES: PatchNoteItem[] = [definePatchNote({
    id: "release-1-2-0",
    version: "v.1.2.0",
    title: "v.1.2.0 업데이트",
    summary: "참가자 관리와 명단 확인 경험을 개선했습니다.",
    date: "2026.09.09",
    changes: [
      {
        type: "New",
        title: "참가자 목록 다운로드",
        description: "참가자 목록을 Excel 파일로 다운로드할 수 있습니다.",
      },
      {
        type: "Fixed",
        title: "회원 탈퇴 오류 수정",
        description:
          "모바일 환경에서 회원 탈퇴가 정상적으로 처리되지 않던 문제를 수정했습니다.",
      },
    ],
  }),]; //바로 왼쪽 배열에 추가하시면 됩니다. 자세한 기준은 노션 페이지 확인해주세요.

export function getPatchNoteById(id: string): PatchNoteItem | undefined {
  return PATCH_NOTES.find((note) => note.id === id);
}

export function definePatchNote(note: PatchNoteItem): PatchNoteItem {
  return note;
}

export function getPatchNoteTypes(note: PatchNoteItem): PatchNoteType[] {
  return Array.from(new Set(note.changes.map((change) => change.type)));
}
