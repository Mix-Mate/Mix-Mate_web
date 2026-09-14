import type { SheetData } from "write-excel-file/universal";
import type { RosterMember } from "../types/roster.types";

const INVALID_FILE_NAME_CHARACTERS = /[<>:"/\\|?*\u0000-\u001f]/g;
const TRAILING_FILE_NAME_CHARACTERS = /[. ]+$/g;

const headerCell = (value: string) => ({
  value,
  fontWeight: "bold" as const,
  backgroundColor: "#EEF4FF",
  align: "center" as const,
});

export function sanitizeExcelFileBaseName(groupName: string): string {
  const sanitized = groupName
    .trim()
    .replace(INVALID_FILE_NAME_CHARACTERS, "_")
    .replace(/_+/g, "_")
    .replace(TRAILING_FILE_NAME_CHARACTERS, "")
    .slice(0, 80)
    .replace(TRAILING_FILE_NAME_CHARACTERS, "");

  return sanitized || "MixMate";
}

export function createParticipantRosterSheet(
  members: RosterMember[],
): SheetData {
  return [
    [
      headerCell("학번"),
      headerCell("이름"),
      headerCell("학과"),
      headerCell("성별"),
    ],
    ...members.map((member) => [
      member.studentId,
      member.displayName,
      member.major,
      member.gender === "MALE" ? "남성" : "여성",
    ]),
  ];
}

export function createTeamRosterSheet(members: RosterMember[]): SheetData {
  const sortedMembers = [...members].sort(
    (a, b) => (a.teamNumber ?? 0) - (b.teamNumber ?? 0),
  );

  return [
    [
      headerCell("조번호"),
      headerCell("학번"),
      headerCell("이름"),
      headerCell("학과"),
    ],
    ...sortedMembers.map((member) => [
      member.teamNumber,
      member.studentId,
      member.displayName,
      member.major,
    ]),
  ];
}

export async function downloadRosterExcel({
  data,
  fileName,
  sheetName,
  columnWidths,
}: {
  data: SheetData;
  fileName: string;
  sheetName: string;
  columnWidths: number[];
}): Promise<void> {
  const { default: writeExcelFile } =
    await import("write-excel-file/universal");
  const blob = await writeExcelFile(data, {
    sheet: sheetName,
    columns: columnWidths.map((width) => ({ width })),
    stickyRowsCount: 1,
  }).toBlob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
