import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/shared/api/apiFetch";
import { getGroupDetail } from "@/features/group/api/group.api";
import {
  blockParticipantApi,
  getGroupBlacklist,
  readStoredBlacklist,
  unblockParticipantApi,
  writeStoredBlacklist,
} from "./blacklist.api";

vi.mock("@/shared/api/apiFetch", () => ({ apiFetch: vi.fn() }));
vi.mock("@/features/group/api/group.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/group/api/group.api")>();
  return { ...actual, getGroupDetail: vi.fn() };
});

const participant = {
  id: "202",
  name: "이순신",
  email: "sunshin@example.com",
};

function response(
  ok: boolean,
  status: number,
  body: Record<string, unknown> = {},
) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("blacklist api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(getGroupDetail).mockResolvedValue({
      groupId: 17,
      groupName: "테스트 모임",
      description: null,
      status: "RECRUITING",
      inviteCode: "ABC1234",
      createdAt: "2026-08-30T00:00:00.000Z",
      memberCount: 5,
      myRole: "HOST",
      myParticipantId: 1,
    });
  });

  it("서버가 차단 요청을 거절하면 로컬 목록을 변경하지 않는다", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      response(false, 409, { message: "조 편성 전만 가능합니다." }),
    );

    await expect(
      blockParticipantApi("17", participant, { reason: "비매너" }),
    ).rejects.toThrow("조 편성 전만 가능합니다.");
    expect(readStoredBlacklist("17")).toEqual([]);
  });

  it("차단 성공 후에만 실제 이메일과 사유를 로컬 목록에 동기화한다", async () => {
    vi.mocked(apiFetch).mockResolvedValue(response(true, 200));

    await blockParticipantApi("17", participant, { reason: " 비매너 " });

    expect(readStoredBlacklist("17")).toEqual([
      expect.objectContaining({
        id: "202",
        email: "sunshin@example.com",
        reason: "비매너",
      }),
    ]);
  });

  it("차단 해제 실패 시 기존 로컬 목록을 보존한다", async () => {
    writeStoredBlacklist("17", [
      {
        id: "202",
        userId: 202,
        name: "이순신",
        displayName: "이순신",
        email: "sunshin@example.com",
        reason: "테스트",
        blockedAt: "2026-08-30T00:00:00.000Z",
        bannedAt: "2026-08-30T00:00:00.000Z",
      },
    ]);
    vi.mocked(apiFetch).mockResolvedValue(
      response(false, 500, { message: "서버 내부 오류" }),
    );

    await expect(unblockParticipantApi("17", 202)).rejects.toThrow(
      "서버 내부 오류",
    );
    expect(readStoredBlacklist("17")).toHaveLength(1);
  });

  it("서버 차단 목록의 같은 사용자를 하나로 합친다", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      response(true, 200, {
        banList: [
          { userId: 101, displayName: "홍길동", reason: "비매너" },
          { userId: 101, displayName: "홍길동", reason: "사유 수정" },
        ],
      }),
    );

    const result = await getGroupBlacklist("17");

    expect(result.participants).toHaveLength(1);
    expect(result.participants[0]).toEqual(
      expect.objectContaining({ userId: 101, reason: "사유 수정" }),
    );
  });
});
