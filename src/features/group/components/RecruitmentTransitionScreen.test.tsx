import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RecruitmentTransitionScreen from "./RecruitmentTransitionScreen";

describe("RecruitmentTransitionScreen", () => {
  it("모집 마감 처리 중인 상태를 안내한다", () => {
    render(<RecruitmentTransitionScreen phase="closing" />);

    expect(screen.getByRole("status")).toHaveTextContent("모집 마감 중");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "모임 준비 중",
    );
    expect(screen.getByTestId("recruitment-transition")).toHaveAttribute(
      "data-phase",
      "closing",
    );
  });

  it("마감 후 그룹 홈을 준비하는 상태를 안내한다", () => {
    render(<RecruitmentTransitionScreen />);

    const status = screen.getByRole("status");

    expect(status).toHaveTextContent("모집 마감 완료");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "그룹 홈 준비 중",
    );
  });

  it("헤더와 상하단 배경무늬 없이 중앙 그래픽만 유지한다", () => {
    const { container } = render(<RecruitmentTransitionScreen />);

    expect(container.querySelector("header")).not.toBeInTheDocument();
    expect(
      container.querySelector('[class*="ambient"]'),
    ).not.toBeInTheDocument();
    expect(container.querySelector('[class*="halo"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="orbit"]')).toBeInTheDocument();
  });
});
