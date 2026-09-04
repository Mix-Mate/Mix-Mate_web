import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getParticipants } from "./participant.api";

const fetchMock = vi.fn<typeof fetch>();

describe("getParticipants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("그룹 상세 조회 없이 참가자와 팀 목록만 요청한다", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            participantList: [
              {
                participantId: 1,
                displayName: "다래",
                major: "컴퓨터공학",
                gender: "FEMALE",
                visibility: "PUBLIC",
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ teams: [] }), { status: 200 }),
      );

    const result = await getParticipants("6");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      fetchMock.mock.calls.map(([url]) => String(url)),
    ).toEqual([
      expect.stringMatching(/\/api\/v1\/groups\/6\/participants\?round=/),
      expect.stringMatching(/\/api\/v1\/groups\/6\/rounds\/.*\/teams$/),
    ]);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).endsWith("/api/v1/groups/6"),
      ),
    ).toBe(false);
    expect(result).toEqual({
      participants: [
        {
          id: "1",
          name: "다래",
          department: "컴퓨터공학",
          gender: "female",
          visibility: "public",
          role: "general",
        },
      ],
      teams: [],
    });
  });

  it("팀 목록이 필요하지 않으면 participants API만 요청한다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        participantList: [
          {
            participantId: 1,
            displayName: "다래",
            major: "컴퓨터공학",
            gender: "FEMALE",
            visibility: "PUBLIC",
          },
        ],
      }),
    );

    const result = await getParticipants("6", 1, { includeTeams: false });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/api\/v1\/groups\/6\/participants\?round=/,
    );
    expect(result.teams).toEqual([]);
  });

  it("상세 보강을 끄면 관리자 목록에서도 개별 프로필 API를 요청하지 않는다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        participantList: [
          {
            participantId: 133,
            displayName: "수동 참가자",
            major: "컴퓨터공학",
            gender: "MALE",
            visibility: "PRIVATE",
          },
        ],
      }),
    );

    const result = await getParticipants("6", 1, {
      detailRole: "admin",
      hydrateProfiles: false,
      includeTeams: false,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/api\/v1\/groups\/6\/participants\?/,
    );
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("/participants/133"),
      ),
    ).toBe(false);
    expect(result.participants[0]).toMatchObject({
      id: "133",
      name: "수동 참가자",
      visibility: "private",
    });
  });
});
