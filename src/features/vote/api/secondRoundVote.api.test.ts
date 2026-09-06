import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { apiFetch } from "@/shared/api/apiFetch";
import { updateSecondRoundVote, voteSecondRound } from "./secondRoundVote.api";

vi.mock("@/shared/api/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

describe("second-round vote api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("첫 투표는 POST 요청으로 전송한다", async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 204 }));

    await voteSecondRound("23", "PARTICIPATE");

    expect(apiFetch).toHaveBeenCalledExactlyOnceWith(
      `${API_BASE_URL}/api/v1/groups/23/votes/second-round`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: "PARTICIPATE" }),
      },
    );
  });

  it("기존 투표 정정은 같은 엔드포인트에 PATCH 요청으로 전송한다", async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(null, { status: 204 }));

    await updateSecondRoundVote("23", "NOT_PARTICIPATE");

    expect(apiFetch).toHaveBeenCalledExactlyOnceWith(
      `${API_BASE_URL}/api/v1/groups/23/votes/second-round`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: "NOT_PARTICIPATE" }),
      },
    );
  });

  it("PATCH 실패 시 서버의 오류 코드와 메시지를 보존한다", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      Response.json(
        {
          code: "VOTE_NOT_IN_PROGRESS",
          message: "투표가 진행중이 아닙니다.",
        },
        { status: 409 },
      ),
    );

    const request = updateSecondRoundVote("23", "PARTICIPATE");

    await expect(request).rejects.toMatchObject({
      status: 409,
      code: "VOTE_NOT_IN_PROGRESS",
      message: "투표가 진행중이 아닙니다.",
    });
  });
});
