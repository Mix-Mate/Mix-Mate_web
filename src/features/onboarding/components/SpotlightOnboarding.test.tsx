import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SpotlightOnboarding from "./SpotlightOnboarding";

const CONTAINER_HEIGHT = 800;
const COACH_MARK_HEIGHT = 160;

interface StubbedRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

let targetRect: StubbedRect = { top: 0, left: 0, width: 0, height: 0 };

function toDomRect({ top, left, width, height }: StubbedRect): DOMRect {
  return {
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

// jsdom은 레이아웃을 계산하지 않으므로, 실제 DOM 좌표를 읽는 경로만 흉내 낸다.
vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
  function (this: Element) {
    if (this.getAttribute("data-testid") === "onboarding-target") {
      return toDomRect(targetRect);
    }

    if (this.getAttribute("data-testid") === "spotlight-onboarding") {
      return toDomRect({
        top: 0,
        left: 0,
        width: 390,
        height: CONTAINER_HEIGHT,
      });
    }

    if (this.getAttribute("role") === "dialog") {
      return toDomRect({
        top: 0,
        left: 0,
        width: 358,
        height: COACH_MARK_HEIGHT,
      });
    }

    return toDomRect({ top: 0, left: 0, width: 0, height: 0 });
  },
);

function OnboardingHarness() {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div data-testid="onboarding-target" ref={targetRef} />
      <SpotlightOnboarding
        steps={[
          {
            id: "only-step",
            title: "제목",
            description: "설명",
            targetRef,
          },
        ]}
        onDismiss={vi.fn()}
      />
    </>
  );
}

function getSpotlight() {
  const spotlight = screen
    .getByTestId("spotlight-onboarding")
    .querySelector<HTMLElement>("[aria-hidden='true']");

  if (!spotlight) throw new Error("스포트라이트를 찾지 못했습니다.");

  return spotlight.style;
}

describe("SpotlightOnboarding", () => {
  afterEach(() => {
    cleanup();
  });

  it("대상 DOM의 실제 좌표에 여백을 더해 스포트라이트를 그린다", () => {
    targetRect = { top: 100, left: 20, width: 350, height: 120 };

    render(<OnboardingHarness />);

    const spotlight = getSpotlight();
    expect(spotlight.top).toBe("92px");
    expect(spotlight.left).toBe("12px");
    expect(spotlight.width).toBe("366px");
    expect(spotlight.height).toBe("136px");
  });

  it("아래에 자리가 있으면 코치마크를 강조 영역 아래에 둔다", () => {
    targetRect = { top: 100, left: 20, width: 350, height: 120 };

    render(<OnboardingHarness />);

    // 강조 영역 하단(92px + 136px) + 간격(14px)
    expect(screen.getByRole("dialog").style.top).toBe("242px");
  });

  it("아래 공간이 부족하면 코치마크를 강조 영역 위로 올린다", () => {
    targetRect = { top: 700, left: 20, width: 350, height: 60 };

    render(<OnboardingHarness />);

    // 강조 영역 상단(692px) - 간격(14px) - 코치마크 높이(160px)
    expect(screen.getByRole("dialog").style.top).toBe("518px");
  });

  it("창 크기가 바뀌면 위치를 다시 계산한다", () => {
    targetRect = { top: 100, left: 20, width: 350, height: 120 };

    render(<OnboardingHarness />);
    expect(getSpotlight().top).toBe("92px");

    targetRect = { top: 300, left: 20, width: 350, height: 120 };
    fireEvent(window, new Event("resize"));

    expect(getSpotlight().top).toBe("292px");
  });

  it("스크롤되면 위치를 다시 계산한다", () => {
    targetRect = { top: 100, left: 20, width: 350, height: 120 };

    render(<OnboardingHarness />);

    targetRect = { top: 40, left: 20, width: 350, height: 120 };
    fireEvent.scroll(screen.getByTestId("onboarding-target"));

    expect(getSpotlight().top).toBe("32px");
  });
});
