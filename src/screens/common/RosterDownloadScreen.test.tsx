import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getTeams,
  hasSecondRoundTeams,
} from "@/features/assignment/api/assignment.api";
import { getParticipants } from "@/features/participant/api/participant.api";
import type { ParticipantGroup } from "@/features/participant/types/participant.types";
import { downloadRosterExcel } from "@/features/roster-download/lib/roster-excel";
import RosterDownloadScreen from "./RosterDownloadScreen";

const { back } = vi.hoisted(() => ({ back: vi.fn() }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "17" }),
  useRouter: () => ({ back }),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: () => ({
    data: {
      groupId: 17,
      groupName: "로블록스/A팀",
      memberCount: 4,
    },
  }),
}));

vi.mock("@/features/participant/api/participant.api", () => ({
  getParticipants: vi.fn(),
}));

vi.mock("@/features/assignment/api/assignment.api", () => ({
  getTeams: vi.fn(),
  hasSecondRoundTeams: vi.fn(),
}));

vi.mock(
  "@/features/roster-download/lib/roster-excel",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/features/roster-download/lib/roster-excel")
    >()),
    downloadRosterExcel: vi.fn(),
  }),
);

const getParticipantsMock = vi.mocked(getParticipants);
const getTeamsMock = vi.mocked(getTeams);
const hasSecondRoundTeamsMock = vi.mocked(hasSecondRoundTeams);
const downloadRosterExcelMock = vi.mocked(downloadRosterExcel);

describe("RosterDownloadScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasSecondRoundTeamsMock.mockResolvedValue(true);
  });

  it("2차 진행 여부를 확인하는 동안 카드 스켈레톤을 표시한다", () => {
    hasSecondRoundTeamsMock.mockReturnValue(new Promise(() => {}));

    render(<RosterDownloadScreen />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "명단 정보를 불러오는 중입니다.",
    );
    expect(screen.getAllByTestId("roster-card-skeleton")).toHaveLength(2);
  });

  it("2차 조 편성이 없으면 1차 카드만 표시한다", async () => {
    hasSecondRoundTeamsMock.mockResolvedValue(false);

    render(<RosterDownloadScreen />);

    await waitFor(() => {
      expect(hasSecondRoundTeamsMock).toHaveBeenCalledWith(
        "17",
        expect.any(AbortSignal),
      );
    });
    expect(
      screen.getByRole("button", {
        name: "1차 술자리 참가자 명단 Excel 다운로드",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "1차 조 명단 Excel 다운로드" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("2차 술자리 참가자 명단"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("2차 조 명단")).not.toBeInTheDocument();
  });

  it("1차 참가자 API 응답으로 지정된 파일명과 시트명의 Excel을 다운로드한다", async () => {
    getParticipantsMock.mockResolvedValue({
      participants: [
        {
          id: "1",
          name: "김민준",
          department: "컴퓨터공학과",
          gender: "male",
          role: "general",
          visibility: "public",
        },
      ],
      teams: [],
    });

    render(<RosterDownloadScreen />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /1차 술자리 참가자 명단.*Excel/,
      }),
    );

    await waitFor(() => {
      expect(getParticipantsMock).toHaveBeenCalledWith("17", 1, {
        hydrateProfiles: false,
        includeTeams: false,
      });
    });
    expect(downloadRosterExcelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "로블록스_A팀_1차_참가자명단.xlsx",
        sheetName: "1차 참가자",
      }),
    );
    expect(screen.getByText("1명")).toBeInTheDocument();
  });

  it("2차 조 API 응답의 모든 멤버를 한 시트로 내려받는다", async () => {
    getTeamsMock.mockResolvedValue([
      {
        teamNumber: 3,
        members: [
          {
            participantId: 9,
            displayName: "박다래",
            major: "컴퓨터공학과",
            gender: "FEMALE",
            visibility: "PUBLIC",
            fixed: false,
          },
        ],
      },
    ]);

    render(<RosterDownloadScreen />);
    fireEvent.click(
      await screen.findByRole("button", { name: /2차 조 명단.*Excel/ }),
    );

    await waitFor(() => {
      expect(getTeamsMock).toHaveBeenCalledWith("17", 2);
    });
    expect(downloadRosterExcelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([[3, "박다래", "컴퓨터공학과"]]),
        fileName: "로블록스_A팀_2차_조명단.xlsx",
        sheetName: "2차 조 명단",
      }),
    );
  });

  it("데이터가 없으면 빈 파일을 만들지 않고 Toast로 안내한다", async () => {
    getTeamsMock.mockResolvedValue([]);

    render(<RosterDownloadScreen />);
    fireEvent.click(screen.getByRole("button", { name: /1차 조 명단.*Excel/ }));

    expect(
      await screen.findByText("1차 조 명단에 데이터가 없습니다."),
    ).toBeInTheDocument();
    expect(downloadRosterExcelMock).not.toHaveBeenCalled();
  });

  it("요청 중인 버튼만 비활성화한다", async () => {
    let resolveParticipants!: (value: ParticipantGroup) => void;
    getParticipantsMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveParticipants = resolve;
        }),
    );

    render(<RosterDownloadScreen />);
    const firstParticipantButton = screen.getByRole("button", {
      name: /1차 술자리 참가자 명단.*Excel/,
    });
    const secondParticipantButton = await screen.findByRole("button", {
      name: /2차 술자리 참가자 명단.*Excel/,
    });

    fireEvent.click(firstParticipantButton);

    expect(firstParticipantButton).toBeDisabled();
    expect(secondParticipantButton).not.toBeDisabled();

    resolveParticipants({ participants: [], teams: [] });
    await waitFor(() => expect(firstParticipantButton).not.toBeDisabled());
  });
});
