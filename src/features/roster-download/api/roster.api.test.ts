import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { apiFetch } from "@/shared/api/apiFetch";
import { getGroupRoster } from "./roster.api";

vi.mock("@/shared/api/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);

describe("getGroupRoster", () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it("관리자용 그룹 명단을 단일 roster endpoint에서 조회한다", async () => {
    const roster = {
      groupName: "믹스메이트",
      rounds: [
        {
          round: "FIRST_ROUND" as const,
          assigned: true,
          members: [],
        },
      ],
    };
    const signal = new AbortController().signal;
    mockedApiFetch.mockResolvedValue(
      new Response(JSON.stringify(roster), { status: 200 }),
    );

    await expect(getGroupRoster("12", signal)).resolves.toEqual(roster);
    expect(mockedApiFetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/v1/groups/12/roster`,
      {
        headers: { Accept: "application/json" },
        signal,
      },
    );
  });

  it("실패 응답의 서버 메시지를 전달한다", async () => {
    mockedApiFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "FORBIDDEN",
          message: "이 그룹의 관리자가 아닙니다.",
        }),
        { status: 403 },
      ),
    );

    await expect(getGroupRoster("12")).rejects.toThrow(
      "이 그룹의 관리자가 아닙니다.",
    );
  });
});

