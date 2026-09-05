import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GroupCreateScreen from "./GroupCreateScreen";

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe("GroupCreateScreen", () => {
  it("그룹명과 설명 입력 필드에 maxLength와 설명 카운터가 표시된다", () => {
    render(<GroupCreateScreen />);

    const groupNameInput = screen.getByLabelText(/그룹명/);
    const descTextarea = screen.getByLabelText(/설명 \(선택\)/);

    expect(groupNameInput).toHaveAttribute("maxLength", "30");
    expect(descTextarea).toHaveAttribute("maxLength", "120");

    // 초기 글자 수 카운터 (0/120)
    expect(screen.getByText("0/120")).toBeInTheDocument();
  });

  it("설명 입력 시 글자 수 카운터가 실시간으로 갱신된다", () => {
    render(<GroupCreateScreen />);

    const descTextarea = screen.getByLabelText(/설명 \(선택\)/);
    fireEvent.change(descTextarea, { target: { value: "안녕하세요 모임입니다." } });

    expect(screen.getByText("12/120")).toBeInTheDocument();
  });

  it("그룹명을 입력하지 않으면 제출 버튼이 비활성화된다", () => {
    render(<GroupCreateScreen />);

    const submitButton = screen.getByRole("button", { name: "조 편성하기" });
    expect(submitButton).toBeDisabled();

    const groupNameInput = screen.getByLabelText(/그룹명/);
    fireEvent.change(groupNameInput, { target: { value: "새 그룹" } });

    expect(submitButton).toBeEnabled();
  });
});
