import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import BottomSheetDialog from "./BottomSheetDialog";

function DialogHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        모달 열기
      </button>
      <BottomSheetDialog
        open={open}
        titleId="test-dialog-title"
        sheetClassName="test-sheet"
        onClose={() => setOpen(false)}
      >
        <h2 id="test-dialog-title">테스트 모달</h2>
        <button type="button" onClick={() => setOpen(false)}>
          취소
        </button>
        <button type="button">확정</button>
      </BottomSheetDialog>
    </>
  );
}

describe("BottomSheetDialog", () => {
  it("열린 동안 배경을 격리하고 포커스를 가둔 뒤 닫힐 때 복원한다", () => {
    render(<DialogHarness />);

    const trigger = screen.getByRole("button", { name: "모달 열기" });
    trigger.focus();
    fireEvent.click(trigger);

    const cancelButton = screen.getByRole("button", { name: "취소" });
    const confirmButton = screen.getByRole("button", { name: "확정" });

    expect(trigger).toHaveAttribute("inert");
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    expect(cancelButton).toHaveFocus();

    confirmButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(cancelButton).toHaveFocus();

    cancelButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(confirmButton).toHaveFocus();

    fireEvent.click(cancelButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute("inert");
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    expect(trigger).toHaveFocus();
  });
});
