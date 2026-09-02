import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GROUP_STATUSES } from "../types/group.types";
import { subscribeGroupStatus } from "./groupStatusStream.api";

const fetchMock = vi.fn<typeof fetch>();
let streams: ReadableStreamDefaultController<Uint8Array>[];
let stop: (() => void) | undefined;
const onStatus = vi.fn();
const onError = vi.fn();
const encoder = new TextEncoder();

function streamResponse(signal?: AbortSignal | null) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        streams.push(controller);
        signal?.addEventListener(
          "abort",
          () => {
            controller.error(new DOMException("Aborted", "AbortError"));
          },
          { once: true },
        );
      },
    }),
    { headers: { "Content-Type": "text/event-stream;charset=UTF-8" } },
  );
}

async function connect() {
  stop = subscribeGroupStatus("6", { onStatus, onError });
  await vi.advanceTimersByTimeAsync(0);
}

async function send(text: string, index = streams.length - 1) {
  streams[index].enqueue(encoder.encode(text));
  await vi.advanceTimersByTimeAsync(0);
}

describe("group status SSE transport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("accessToken", "test-token");
    streams = [];
    fetchMock.mockImplementation(async (_input, init) =>
      streamResponse(init?.signal),
    );
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();
  });

  it("Bearer 인증으로 한 번 연결하고 상태 변경이 없어도 GET을 반복하지 않는다", async () => {
    await connect();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/groups\/6\/status\/stream$/);
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
    expect(new Headers(init?.headers).get("Accept")).toBe("text/event-stream");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each(GROUP_STATUSES)(
    "최초/변경 status 이벤트를 처리한다: %s",
    async (status) => {
      await connect();
      await send(`event:status\ndata:{"groupId":6,"status":"${status}"}\n\n`);
      expect(onStatus).toHaveBeenCalledExactlyOnceWith({ groupId: 6, status });
    },
  );

  it("분할 청크와 CRLF를 처리하고 heartbeat·다른 이벤트·잘못된 payload는 무시한다", async () => {
    await connect();
    await send(
      ':ping\n\nevent:other\ndata:{"groupId":6,"status":"VOTING"}\n\n',
    );
    await send(
      'event:status\ndata:broken\n\nevent:status\ndata:{"groupId":7,"status":"VOTING"}\n\n',
    );
    await send('event:status\ndata:{"groupId":6,"status":"UNKNOWN"}\n\n');
    await send("event:status\r");
    await send('\ndata:{"groupId":6,"sta');
    expect(onStatus).not.toHaveBeenCalled();
    await send('tus":"FIRST_ROUND"}\r\n\r\n');
    expect(onStatus).toHaveBeenCalledExactlyOnceWith({
      groupId: 6,
      status: "FIRST_ROUND",
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it("서버의 30분 정상 종료 후 최신 토큰으로 재연결하고 새 snapshot을 받는다", async () => {
    await connect();
    await send('event:status\ndata:{"groupId":6,"status":"RECRUITING"}\n\n');
    await vi.advanceTimersByTimeAsync(30 * 60_000);
    localStorage.setItem("accessToken", "renewed-token");
    streams[0].close();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      new Headers(fetchMock.mock.calls[1][1]?.headers).get("Authorization"),
    ).toBe("Bearer renewed-token");
    await send('event:status\ndata:{"groupId":6,"status":"SECOND_ROUND"}\n\n');
    expect(onStatus).toHaveBeenLastCalledWith({
      groupId: 6,
      status: "SECOND_ROUND",
    });
  });

  it("네트워크 오류와 5xx는 최대 30초 간격으로 재시도한다", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    fetchMock.mockImplementation(
      async () => new Response(null, { status: 503 }),
    );
    await connect();
    for (const delay of [1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000]) {
      const before = fetchMock.mock.calls.length;
      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(fetchMock).toHaveBeenCalledTimes(before);
      await vi.advanceTimersByTimeAsync(1);
      expect(fetchMock).toHaveBeenCalledTimes(before + 1);
    }
    expect(onError).not.toHaveBeenCalled();
  });

  it.each([401, 403, 404])(
    "HTTP %s는 재시도하지 않고 오류를 전달한다",
    async (status) => {
      fetchMock.mockResolvedValue(
        new Response('{"message":"error"}', {
          status,
          headers: { "Content-Type": "text/event-stream" },
        }),
      );
      await connect();
      expect(onError).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ status }),
      );
      await vi.advanceTimersByTimeAsync(60_000);
      expect(fetchMock).toHaveBeenCalledOnce();
    },
  );

  it("토큰이 없으면 인증 없는 요청을 보내지 않는다", async () => {
    localStorage.clear();
    await connect();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401 }),
    );
  });

  it("잘못된 Content-Type을 성공 연결로 취급하지 않는다", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>login</html>", {
        headers: { "Content-Type": "text/html" },
      }),
    );
    await connect();
    expect(onError).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("해제 시 진행 중인 요청과 재시도 타이머를 모두 중단한다", async () => {
    await connect();
    const signal = fetchMock.mock.calls[0][1]?.signal;
    stop?.();
    expect(signal?.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();

    fetchMock.mockRejectedValue(new TypeError("offline"));
    await connect();
    stop?.();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
