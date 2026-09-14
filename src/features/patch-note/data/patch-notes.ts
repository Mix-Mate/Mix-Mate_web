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
  id: "release-1-1-0",
  version: "v.1.1.0",
  title: "v.1.1.0 업데이트",
  summary:
    "소셜 로그인, 개인정보처리방침, 명단 다운로드와 모바일 사용성을 개선했습니다.",
  date: "2026.09.14",
  changes: [
    {
      type: "New",
      title: "카카오 로그인",
      description:
        "카카오 계정으로 회원가입과 로그인을 진행할 수 있습니다.",
    },
    {
      type: "New",
      title: "구글 로그인",
      description:
        "구글 계정으로 회원가입과 로그인을 진행할 수 있습니다.",
    },
    {
      type: "New",
      title: "패치노트 화면",
      description:
        "메인 화면에서 MixMate의 업데이트 내용을 확인할 수 있습니다.",
    },
    {
      type: "New",
      title: "명단 다운로드",
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
      title: "최근 입력 프로필 자동 입력",
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
      "개인정보 수집 항목과 보유 기간 등을 확인할 수 있는 개인정보처리방침 페이지를 추가하고, 마이페이지에서 바로 확인할 수 있도록 했습니다.",
    },
    {
      type: "Changed",
      title: "그룹 정보 수정 화면",
      description:
        "그룹 홈에서 별도 화면으로 이동해 그룹명과 설명을 수정할 수 있도록 변경했습니다.",
    },
    {
      type: "Changed",
      title: "그룹 삭제 확인 화면",
      description:
        "그룹 삭제 전 확인 화면을 더 명확하게 볼 수 있도록 변경했습니다.",
    },
    {
      type: "Improved",
      title: "입력 오류 안내",
      description:
        "이름, 그룹명, 프로필 등을 입력할 때 잘못된 내용을 바로 확인할 수 있도록 안내를 개선했습니다.",
    },
    {
      type: "Improved",
      title: "탭 이동 표시",
      description:
        "화면에서 탭을 바꿀 때 선택된 탭이 더 자연스럽게 표시되도록 개선했습니다.",
    },
    {
      type: "Improved",
      title: "밸런스 게임 화면",
      description:
        "모바일에서 밸런스 게임 선택지가 눌리거나 잘리지 않도록 화면 구성을 개선했습니다.",
    },
    {
      type: "Improved",
      title: "글자 가독성",
      description:
        "여러 화면의 글자 크기와 굵기를 정리해 내용을 더 읽기 쉽게 개선했습니다.",
    },
    {
      type: "Fixed",
      title: "모바일 하단 팝업 표시 오류",
      description:
        "모바일에서 하단에 열리는 팝업이 순간적으로 튀거나 잘못된 위치에 표시되던 문제를 수정했습니다.",
    },
    {
      type: "Fixed",
      title: "구글 계정 선택 오류",
      description:
        "구글 로그인 시 다른 계정을 선택해도 기존 계정으로 로그인이 시도되던 문제를 수정했습니다.",
    },
    {
      type: "Security",
      title: "소셜 로그인 보안 검증",
      description:
        "카카오 로그인 과정에서 비정상적인 접근과 위조 요청을 방지하는 검증을 강화했습니다.",
    },
  ],
})
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
