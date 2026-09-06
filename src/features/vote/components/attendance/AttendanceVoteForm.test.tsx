import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttendanceVoteForm from "./AttendanceVoteForm";

const defaultProps = {
  isSubmitted: false,
  isClosed: false,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

describe("AttendanceVoteForm", () => {
  it("비동기로 불러온 기존 선택을 반영하고 값이 바뀐 경우에만 정정을 제출한다", () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <AttendanceVoteForm
        {...defaultProps}
        initialChoice={null}
        onSubmit={onSubmit}
      />,
    );

    rerender(
      <AttendanceVoteForm
        {...defaultProps}
        initialChoice="PARTICIPATE"
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByDisplayValue("PARTICIPATE")).toBeChecked();
    const correctionButton = screen.getByRole("button", {
      name: "투표 정정하기",
    });
    expect(correctionButton).toBeDisabled();

    fireEvent.submit(correctionButton.closest("form")!);
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByDisplayValue("NOT_PARTICIPATE"));
    expect(correctionButton).toBeEnabled();
    fireEvent.click(correctionButton);

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("NOT_PARTICIPATE");
  });
});
