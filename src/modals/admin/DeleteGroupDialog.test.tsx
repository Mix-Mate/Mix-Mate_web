import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteGroupDialog from "./DeleteGroupDialog";

describe("DeleteGroupDialog", () => {
  it("중앙 Alert Dialog에 삭제 확인 문구와 액션을 표시한다", () => {
    render(
      <DeleteGroupDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );

    expect(
      screen.getByRole("alertdialog", { name: "그룹을 삭제할까요?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("이 세션은 되돌릴 수 없습니다"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "삭제하기" })).toBeEnabled();
  });

  it("취소와 삭제 액션을 각각 연결한다", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteGroupDialog open={true} onClose={onClose} onConfirm={onConfirm} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    fireEvent.click(screen.getByRole("button", { name: "삭제하기" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("overlay와 Escape로 닫고 취소 버튼에 초기 포커스를 둔다", () => {
    const onClose = vi.fn();

    render(
      <DeleteGroupDialog open={true} onClose={onClose} onConfirm={vi.fn()} />,
    );

    const dialog = screen.getByRole("alertdialog");
    expect(screen.getByRole("button", { name: "취소" })).toHaveFocus();

    fireEvent.mouseDown(dialog.parentElement as HTMLElement);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("삭제 요청 중에는 중복 클릭과 임의 닫기를 막는다", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteGroupDialog
        open={true}
        isDeleting={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    const dialog = screen.getByRole("alertdialog");
    fireEvent.mouseDown(dialog.parentElement as HTMLElement);
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "삭제 중..." }));

    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "삭제 중..." })).toBeDisabled();
  });
});
