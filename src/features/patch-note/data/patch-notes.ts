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

export const PATCH_NOTES: PatchNoteItem[] = [
  definePatchNote({
    id: "release-1-2-0",
    version: "v.1.2.0",
    title: "v.1.2.0 업데이트",
    summary:
      "카카오 로그인, 패치노트, 명단 다운로드와 프로필 입력 경험을 개선했습니다.",
    date: "2026.09.13",
    changes: [
      {
        type: "New",
        title: "카카오 로그인",
        description:
          "카카오 계정으로 회원가입과 로그인을 진행할 수 있습니다.",
      },
      {
        type: "New",
        title: "패치노트 화면",
        description:
          "메인 화면에서 MixMate의 업데이트 내용을 패치노트로 확인할 수 있습니다.",
      },
      {
        type: "New",
        title: "종료 그룹 명단 다운로드",
        description:
          "종료된 그룹의 참가자 명단과 조 명단을 Excel 파일로 다운로드할 수 있습니다.",
      },
      {
        type: "New",
        title: "사용자 이름 수정",
        description:
          "마이페이지에서 사용자 이름을 직접 수정할 수 있습니다.",
      },
      {
        type: "New",
        title: "최근 입력 프로필 자동 채움",
        description:
          "그룹 생성과 입장 시 최근에 입력한 프로필 정보가 자동으로 채워집니다.",
      },
      {
        type: "New",
        title: "프로필 학번 입력",
        description:
          "그룹 생성, 그룹 입장, 내 프로필 수정, 참가자 추가 화면에서 학번을 입력할 수 있습니다.",
      },
      {
        type: "New",
        title: "개인정보처리방침",
        description:
          "개인정보 수집 항목과 보유 기간 등을 확인할 수 있는 개인정보처리방침 페이지를 추가했습니다.",
      },
      {
        type: "Changed",
        title: "그룹 정보 수정 방식",
        description:
          "그룹 홈에서 별도 그룹 정보 수정 화면으로 이동해 그룹명과 설명을 수정할 수 있도록 변경했습니다.",
      },
      {
        type: "Changed",
        title: "그룹 삭제 확인 방식",
        description:
          "그룹 삭제 확인 화면을 중앙 알림창 형태로 변경해 중요한 작업을 더 명확하게 확인할 수 있도록 했습니다.",
      },
      {
        type: "Changed",
        title: "상단 헤더 규격",
        description:
          "여러 화면의 상단 헤더 높이와 여백을 통일해 화면 전환 시 흔들림을 줄였습니다.",
      },
      {
        type: "Removed",
        title: "참가자 엑셀 업로드 방식",
        description:
          "참가자 추가 화면에서 엑셀 업로드 방식을 제거하고 수동 입력 방식으로 유지했습니다.",
      },
      {
        type: "Fixed",
        title: "모바일 바텀시트 표시 오류",
        description:
          "모바일에서 바텀시트가 순간적으로 튀거나 잘못된 위치에 표시되던 문제를 수정했습니다.",
      },
      {
        type: "Improved",
        title: "입력값 검증 안내",
        description:
          "이름, 그룹명, 프로필 등 주요 입력폼에서 잘못된 입력을 더 빠르게 확인할 수 있도록 개선했습니다.",
      },
      {
        type: "Improved",
        title: "탭 전환 애니메이션",
        description:
          "탭을 전환할 때 선택 표시가 더 자연스럽게 이동하도록 개선했습니다.",
      },
      {
        type: "Improved",
        title: "밸런스 게임 화면",
        description:
          "모바일 화면에서 밸런스 게임 선택지가 눌리거나 깨지지 않도록 레이아웃을 개선했습니다.",
      },
      {
        type: "Improved",
        title: "전체 화면 가독성",
        description:
          "텍스트 역할에 맞게 폰트를 정리하고 주요 상태값의 가독성을 개선했습니다.",
      },
      {
        type: "Security",
        title: "카카오 로그인 보안 검증",
        description:
          "카카오 로그인 과정에서 비정상적인 접근과 위조 요청을 방지하는 검증을 강화했습니다.",
      },
    ],
  }),
]; //바로 왼쪽 배열에 추가하시면 됩니다. 자세한 기준은 노션 페이지 확인해주세요.

export function getPatchNoteById(id: string): PatchNoteItem | undefined {
  return PATCH_NOTES.find((note) => note.id === id);
}

export function definePatchNote(note: PatchNoteItem): PatchNoteItem {
  return note;
}

export function getPatchNoteTypes(note: PatchNoteItem): PatchNoteType[] {
  return Array.from(new Set(note.changes.map((change) => change.type)));
}
