import { afterEach, describe, expect, it } from "vitest";
import { getHistoryPosition, trackHistoryPositions } from "./history-position";

let stop: (() => void) | undefined;
afterEach(() => stop?.());

describe("히스토리 위치 기록", () => {
  it("초기화·replace는 항목을 늘리지 않고 Next 라우터 상태를 유지한다", () => {
    history.replaceState(
      { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ["test"] },
      "",
    );
    const length = history.length;
    stop = trackHistoryPositions();
    expect(history.length).toBe(length);
    expect(getHistoryPosition()).toBe(0);
    history.pushState({ __NA: true }, "", "/groups/7/votes/mvp");
    expect(history.length).toBe(length + 1);
    expect(getHistoryPosition()).toBe(1);
    history.replaceState(
      { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ["attendance"] },
      "",
      "/groups/7/votes/attendance",
    );
    expect(history.length).toBe(length + 1);
    expect(getHistoryPosition()).toBe(1);
    expect(history.state).toMatchObject({
      __NA: true,
      __PRIVATE_NEXTJS_INTERNALS_TREE: ["attendance"],
    });
  });

  it("재초기화해도 기존 위치를 유지하고 StrictMode 정리 후 중복 기록하지 않는다", () => {
    history.replaceState({ __NA: true }, "");
    stop = trackHistoryPositions();
    history.pushState({ __NA: true }, "");
    stop();
    stop = trackHistoryPositions();
    expect(getHistoryPosition()).toBe(1);
    history.pushState({ __NA: true }, "");
    expect(getHistoryPosition()).toBe(2);
  });
});
