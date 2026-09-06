"use client";

import { useCallback, useEffect, useLayoutEffect, type RefObject } from "react";

/** 강조 영역에 주는 여백 */
const SPOTLIGHT_PADDING = 8;
/** 강조 영역과 코치마크 사이 간격 */
const COACH_MARK_GAP = 14;
/** 코치마크가 화면 가장자리에 붙지 않도록 두는 여백 */
const EDGE_MARGIN = 16;

interface SpotlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * 강조 영역과 겹치지 않도록 코치마크를 아래/위 중 여유 있는 쪽에 두고,
 * 어느 쪽도 부족하면 컨테이너 안쪽으로 밀어 넣는다.
 */
function resolveCoachMarkTop(
  spotlight: SpotlightBox,
  containerHeight: number,
  coachMarkHeight: number,
) {
  const below = spotlight.top + spotlight.height + COACH_MARK_GAP;
  const above = spotlight.top - COACH_MARK_GAP - coachMarkHeight;
  const maxTop = containerHeight - EDGE_MARGIN - coachMarkHeight;

  if (below <= maxTop) return below;
  if (above >= EDGE_MARGIN) return above;

  const spaceBelow = containerHeight - (spotlight.top + spotlight.height);
  const preferred = spaceBelow >= spotlight.top ? below : above;

  return clamp(preferred, EDGE_MARGIN, maxTop);
}

interface UseSpotlightPositionParams {
  targetRef: RefObject<HTMLElement | null> | null;
  containerRef: RefObject<HTMLElement | null>;
  spotlightRef: RefObject<HTMLElement | null>;
  coachMarkRef: RefObject<HTMLElement | null>;
}

/**
 * 강조 대상 DOM의 실제 위치를 매번 getBoundingClientRect()로 읽어
 * 스포트라이트와 코치마크에 직접 반영한다.
 *
 * 좌표를 리액트 상태로 들고 있으면 스크롤 프레임마다 리렌더가 일어나므로,
 * 레이아웃 이펙트에서 인라인 스타일만 갱신한다(전환 애니메이션은 CSS가 담당).
 */
export function useSpotlightPosition({
  targetRef,
  containerRef,
  spotlightRef,
  coachMarkRef,
}: UseSpotlightPositionParams) {
  const applyPosition = useCallback(() => {
    const target = targetRef?.current;
    const container = containerRef.current;
    const spotlight = spotlightRef.current;
    const coachMark = coachMarkRef.current;

    if (!target || !container || !spotlight || !coachMark) return;

    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const box: SpotlightBox = {
      top: targetRect.top - containerRect.top - SPOTLIGHT_PADDING,
      left: targetRect.left - containerRect.left - SPOTLIGHT_PADDING,
      width: targetRect.width + SPOTLIGHT_PADDING * 2,
      height: targetRect.height + SPOTLIGHT_PADDING * 2,
    };

    spotlight.style.top = `${box.top}px`;
    spotlight.style.left = `${box.left}px`;
    spotlight.style.width = `${box.width}px`;
    spotlight.style.height = `${box.height}px`;

    coachMark.style.top = `${resolveCoachMarkTop(
      box,
      containerRect.height,
      coachMark.getBoundingClientRect().height,
    )}px`;
  }, [coachMarkRef, containerRef, spotlightRef, targetRef]);

  // 첫 페인트 전에 위치를 잡아 스포트라이트가 튀지 않게 한다.
  useLayoutEffect(() => {
    applyPosition();
  }, [applyPosition]);

  // 대상이 화면 밖에 있으면 보이는 위치까지만 스크롤한다(이미 보이면 아무 일도 하지 않는다).
  useEffect(() => {
    targetRef?.current?.scrollIntoView?.({
      block: "nearest",
      behavior: "smooth",
    });
  }, [targetRef]);

  useEffect(() => {
    window.addEventListener("resize", applyPosition);
    window.addEventListener("orientationchange", applyPosition);
    // 내부 스크롤 컨테이너의 스크롤까지 잡으려면 캡처 단계로 들어야 한다.
    window.addEventListener("scroll", applyPosition, true);

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(applyPosition);
    const target = targetRef?.current;
    if (target) observer?.observe(target);
    if (containerRef.current) observer?.observe(containerRef.current);
    // 단계마다 안내 문구 길이가 달라 코치마크 높이도 바뀐다.
    if (coachMarkRef.current) observer?.observe(coachMarkRef.current);

    return () => {
      window.removeEventListener("resize", applyPosition);
      window.removeEventListener("orientationchange", applyPosition);
      window.removeEventListener("scroll", applyPosition, true);
      observer?.disconnect();
    };
  }, [applyPosition, coachMarkRef, containerRef, targetRef]);
}
