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
  it("입력값을 잘라내지 않고 설명 카운터를 표시한다", () => {
    render(<GroupCreateScreen />);

    const groupNameInput = screen.getByLabelText(/그룹명/);
    const descTextarea = screen.getByLabelText(/설명 \(선택\)/);

    expect(groupNameInput).not.toHaveAttribute("maxLength");
    expect(descTextarea).not.toHaveAttribute("maxLength");

    // 초기 글자 수 카운터 (0/120)
    expect(screen.getByText("0/120")).toBeInTheDocument();
  });

  it("blur 이후 허용되지 않은 문자의 필드 에러를 표시하고 수정 중 갱신한다", () => {
    render(<GroupCreateScreen />);

    const groupNameInput = screen.getByLabelText(/그룹명/);
    fireEvent.change(groupNameInput, { target: { value: "동아리🔥" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.blur(groupNameInput);
    expect(
      screen.getByText(
        "그룹 이름에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
      ),
    ).toBeInTheDocument();

    fireEvent.change(groupNameInput, { target: { value: "ㅋㅋ술모임" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("길이 제한을 넘긴 값은 유지하면서 제출과 이동을 막는다", () => {
    render(<GroupCreateScreen />);

    const groupNameInput = screen.getByLabelText(/그룹명/);
    const tooLongName = "가".repeat(31);
    fireEvent.change(groupNameInput, { target: { value: tooLongName } });
    expect(groupNameInput).toHaveValue(tooLongName);

    fireEvent.click(screen.getByRole("button", { name: "조 편성하기" }));

    expect(
      screen.getByText("그룹 이름은 30자를 넘을 수 없습니다."),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("설명 입력 시 글자 수 카운터가 실시간으로 갱신된다", () => {
    render(<GroupCreateScreen />);

    const descTextarea = screen.getByLabelText(/설명 \(선택\)/);
    fireEvent.change(descTextarea, {
      target: { value: "안녕하세요 모임입니다." },
    });

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
