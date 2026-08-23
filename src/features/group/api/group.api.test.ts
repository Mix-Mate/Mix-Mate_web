import { beforeEach, describe, expect, it, vi } from "vitest";
import { leaveGroup } from "./group.api";

const fetchMock = vi.fn<typeof fetch>();

describe("leaveGroup", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sends an authenticated DELETE request without a request payload", async () => {
    const json = vi.fn();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      json,
    } as unknown as Response);

    await leaveGroup("12");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/groups\/12\/participants\/me$/),
      expect.objectContaining({
        method: "DELETE",
        credentials: "include",
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty("body");
    expect(json).not.toHaveBeenCalled();
  });

  it("uses the backend error message when the request fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
      json: vi.fn().mockResolvedValue({
        code: "INVALID_GROUP_STATUS",
        message: "참가자 모집 중에만 탈퇴할 수 있습니다.",
      }),
    } as unknown as Response);

    await expect(leaveGroup("12")).rejects.toThrow(
      "참가자 모집 중에만 탈퇴할 수 있습니다.",
    );
  });

  it("uses the fallback message when the error response is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new SyntaxError("Invalid JSON")),
    } as unknown as Response);

    await expect(leaveGroup("12")).rejects.toThrow("그룹 탈퇴에 실패했습니다.");
  });
});
