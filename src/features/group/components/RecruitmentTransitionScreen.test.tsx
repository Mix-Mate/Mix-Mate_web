import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RecruitmentTransitionScreen from "./RecruitmentTransitionScreen";

describe("RecruitmentTransitionScreen", () => {
  it("모집 마감 처리 중인 상태를 안내한다", () => {
    render(
      <RecruitmentTransitionScreen
        groupName="금요일의 사람들"
        phase="closing"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("모집 마감 중");
    expect(screen.getByRole("status")).toHaveTextContent(
      "참가자 정보를 안전하게 정리하고 있어요.",
    );
    expect(screen.getByTestId("recruitment-transition")).toHaveAttribute(
      "data-phase",
      "closing",
    );
  });

  it("마감 후 그룹 홈을 준비하는 상태를 안내한다", () => {
    render(<RecruitmentTransitionScreen groupName="금요일의 사람들" />);

    const status = screen.getByRole("status");

    expect(status).toHaveTextContent("모집 마감 완료");
    expect(status).toHaveTextContent("금요일의 사람들");
    expect(status).toHaveTextContent("그룹 홈을 준비하고 있어요");
    expect(status).toHaveTextContent(
      "새로운 만남을 시작할 공간을 열고 있어요.",
    );
  });
});
