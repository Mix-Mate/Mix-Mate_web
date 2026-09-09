import type { AssignmentTeam } from "@/features/assignment/types/assignment.types";
import type { Participant } from "@/features/participant/types/participant.types";
import type { SheetData } from "write-excel-file/universal";

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
  participants: Participant[],
): SheetData {
  return [
    [headerCell("이름"), headerCell("학과"), headerCell("성별")],
    ...participants.map((participant) => [
      participant.name,
      participant.department,
      participant.gender === "male" ? "남성" : "여성",
    ]),
  ];
}

export function createTeamRosterSheet(teams: AssignmentTeam[]): SheetData {
  return [
    [headerCell("조번호"), headerCell("이름"), headerCell("학과")],
    ...teams.flatMap((team) =>
      team.members.map((member) => [
        team.teamNumber,
        member.displayName,
        member.major,
      ]),
    ),
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
