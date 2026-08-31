const HISTORY_POSITION_KEY = "__mixmateHistoryPosition";

export function getHistoryPosition(
  state: unknown = window.history.state,
): number | undefined {
  if (typeof state !== "object" || state === null) return undefined;
  const position = (state as Record<string, unknown>)[HISTORY_POSITION_KEY];
  return typeof position === "number" &&
    Number.isSafeInteger(position) &&
    position >= 0
    ? position
    : undefined;
}

function withPosition(state: unknown, position: number) {
  return {
    ...(typeof state === "object" && state !== null ? state : {}),
    [HISTORY_POSITION_KEY]: position,
  };
}

// 항목은 추가하지 않는다. Next의 상태를 보존하면서 실제 push/replace에 위치만 붙인다.
export function trackHistoryPositions() {
  const originalPush = window.history.pushState;
  const originalReplace = window.history.replaceState;
  let active = true;

  if (getHistoryPosition() === undefined) {
    originalReplace.call(
      window.history,
      withPosition(window.history.state, 0),
      "",
    );
  }

  const push: History["pushState"] = function (
    this: History,
    state,
    unused,
    url,
  ) {
    originalPush.call(
      this,
      active ? withPosition(state, (getHistoryPosition() ?? 0) + 1) : state,
      unused,
      url,
    );
  };
  const replace: History["replaceState"] = function (
    this: History,
    state,
    unused,
    url,
  ) {
    originalReplace.call(
      this,
      active ? withPosition(state, getHistoryPosition() ?? 0) : state,
      unused,
      url,
    );
  };
  window.history.pushState = push;
  window.history.replaceState = replace;

  return () => {
    active = false;
    // Next 등이 바깥에 등록한 래퍼는 제거하지 않는다.
    if (window.history.pushState === push)
      window.history.pushState = originalPush;
    if (window.history.replaceState === replace)
      window.history.replaceState = originalReplace;
  };
}
