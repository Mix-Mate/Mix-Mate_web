import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail, GroupStatus } from "@/features/group/types/group.types";
import AdminPreparationScreen from "./AdminPreparationScreen";

const {
  backMock,
  pushMock,
  replaceMock,
  useAdminGroupQueryMock,
} = vi.hoisted(() => ({
  backMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "11" }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: backMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

function createGroup(status: GroupStatus = "BEFORE_FIRST_ROUND"): GroupDetail {
  return {
    groupId: 11,
    groupName: "11번 모임",
    description: null,
    status,
    inviteCode: "XYZ123",
    createdAt: "2026-08-27T00:00:00.000Z",
    memberCount: 6,
    myRole: "HOST",
    myParticipantId: 1,
  };
}

describe("AdminPreparationScreen Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("BEFORE_FIRST_ROUND"),
    });
  });

  it("뒤로가기 버튼 클릭 시 router.back()을 호출하지 않고 router.replace('/home')로 홈 화면으로 이동한다", () => {
    render(<AdminPreparationScreen />);

    const backButton = screen.getByRole("button", {
      name: "이전 화면으로 이동",
    });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/home");
    expect(backMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
