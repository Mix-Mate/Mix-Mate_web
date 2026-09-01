import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMyGroupsApi } from "@/features/group/api/group.api";
import HomeScreen from "./HomeScreen";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/features/group/api/group.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/group/api/group.api")>()),
  getMyGroupsApi: vi.fn(),
}));

const getMyGroupsApiMock = vi.mocked(getMyGroupsApi);

describe("HomeScreen 그룹 진입", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it.each([
    ["BEFORE_FIRST_ROUND", "/groups/31/admin"],
    ["VOTE_CLOSED", "/groups/31/admin"],
    ["BEFORE_SECOND_ROUND", "/groups/31/admin"],
    ["RECRUITING", "/groups/31/admin/recruitment"],
  ])(
    "%s 상태의 관리자 그룹을 올바른 화면으로 바로 연결한다",
    async (status, expectedRoute) => {
      getMyGroupsApiMock.mockImplementation(async (params) => ({
        groups:
          params?.state === "active"
            ? [
                {
                  groupId: 31,
                  groupName: "라우팅 테스트 모임",
                  status,
                  role: "HOST",
                  memberCount: 6,
                },
              ]
            : [],
      }));

      render(<HomeScreen userName="테스터" />);

      fireEvent.click(await screen.findByText("라우팅 테스트 모임"));

      await waitFor(() => {
        expect(push).toHaveBeenCalledExactlyOnceWith(expectedRoute);
      });
    },
  );
});
