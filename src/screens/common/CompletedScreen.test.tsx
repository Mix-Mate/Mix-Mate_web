import { StrictMode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import CompletedScreen from "./CompletedScreen";

const { hasSecondRoundTeamsMock, replaceMock, useAdminGroupQueryMock } =
  vi.hoisted(() => ({
    hasSecondRoundTeamsMock: vi.fn(),
    replaceMock: vi.fn(),
    useAdminGroupQueryMock: vi.fn(),
  }));

vi.mock("@/features/assignment/api/assignment.api", () => ({
  hasSecondRoundTeams: hasSecondRoundTeamsMock,
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string | { src?: string };
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : src?.src || ""}
      alt={alt || ""}
      {...rest}
    />
  ),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "11" }),
  useRouter: () => ({
    push: vi.fn(),
    replace: replaceMock,
    back: vi.fn(),
  }),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

function createGroup(): GroupDetail {
  return {
    groupId: 11,
    groupName: "종료된 모임",
    description: null,
    status: "FINISHED",
    inviteCode: "FIN123",
    createdAt: "2026-08-27T00:00:00.000Z",
    memberCount: 6,
    myRole: "PARTICIPANT",
    myParticipantId: 1,
  };
}

describe("CompletedScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasSecondRoundTeamsMock.mockResolvedValue(true);
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup(),
    });
  });

  it("'모든 술자리가 종료되었습니다' 문구가 렌더링된다", () => {
    render(<CompletedScreen />);

    expect(screen.getByText("모임 종료")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /모든 술자리가\s*종료되었습니다/ }),
    ).toBeInTheDocument();
  });

  it("메인 홈으로 돌아가기 버튼 클릭 시 스플래시 화면을 거치도록 router.replace('/')를 호출한다", () => {
    render(<CompletedScreen />);

    const returnHomeButton = screen.getByRole("button", {
      name: "메인 홈으로 돌아가기",
    });
    fireEvent.click(returnHomeButton);

    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("개발 모드의 Strict Mode에서도 teams API를 한 번만 요청한다", async () => {
    render(
      <StrictMode>
        <CompletedScreen />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(hasSecondRoundTeamsMock).toHaveBeenCalledOnce();
    });
  });
});
