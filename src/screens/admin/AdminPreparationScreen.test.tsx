import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupStatus,
} from "@/features/group/types/group.types";
import AdminPreparationScreen from "./AdminPreparationScreen";

const { backMock, pushMock, replaceMock, useAdminGroupQueryMock } = vi.hoisted(
  () => ({
    backMock: vi.fn(),
    pushMock: vi.fn(),
    replaceMock: vi.fn(),
    useAdminGroupQueryMock: vi.fn(),
  }),
);

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

  it.each(["BEFORE_FIRST_ROUND", "BEFORE_SECOND_ROUND"] as const)(
    "%s 홈에서 취소하면 머무르고 나가기를 확인해야 메인 홈으로 이동한다",
    (status) => {
      useAdminGroupQueryMock.mockReturnValue({ data: createGroup(status) });
      render(<AdminPreparationScreen />);

      const backButton = screen.getByRole("button", {
        name: "이전 화면으로 이동",
      });
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);

      expect(
        screen.getByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
      ).toBeInTheDocument();
      expect(replaceMock).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "취소" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(replaceMock).not.toHaveBeenCalled();

      fireEvent.click(backButton);
      fireEvent.click(screen.getByRole("button", { name: "나가기" }));
      expect(replaceMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/home");
      expect(backMock).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    },
  );
});
