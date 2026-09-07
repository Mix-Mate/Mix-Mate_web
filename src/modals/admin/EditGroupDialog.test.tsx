import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EditGroupDialog from "./EditGroupDialog";

describe("EditGroupDialog", () => {
  const defaultValues = {
    name: "테스트 모임",
    description: "테스트 설명입니다.",
  };

  it("그룹 정보 편집 모달이 열리면 기본값과 글자 수 카운터가 올바르게 렌더링된다", () => {
    render(
      <EditGroupDialog
        open={true}
        initialValues={defaultValues}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const nameInput = screen.getByLabelText(/그룹명/);
    const descTextarea = screen.getByLabelText(/설명 \(선택\)/);

    expect(nameInput).toHaveValue("테스트 모임");
    expect(nameInput).not.toHaveAttribute("maxLength");

    expect(descTextarea).toHaveValue("테스트 설명입니다.");
    expect(descTextarea).not.toHaveAttribute("maxLength");

    // 카운터 렌더링 확인 (10글자/120)
    expect(screen.getByText("10/120")).toBeInTheDocument();
  });

  it("blur 시 허용되지 않은 그룹명 문자를 필드 에러로 표시한다", async () => {
    render(
      <EditGroupDialog
        open={true}
        initialValues={defaultValues}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const nameInput = screen.getByLabelText(/그룹명/);
    fireEvent.change(nameInput, { target: { value: "모임🔥" } });
    fireEvent.blur(nameInput);

    expect(
      await screen.findByText(
        "그룹 이름에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
      ),
    ).toBeInTheDocument();
  });

  it("설명 입력 시 실시간으로 글자 수 카운터가 갱신된다", () => {
    render(
      <EditGroupDialog
        open={true}
        initialValues={{ name: "테스트", description: "" }}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const descTextarea = screen.getByLabelText(/설명 \(선택\)/);
    expect(screen.getByText("0/120")).toBeInTheDocument();

    fireEvent.change(descTextarea, {
      target: { value: "안녕하세요 반갑습니다!" },
    });
    expect(screen.getByText("12/120")).toBeInTheDocument();
  });

  it("유효한 값을 입력하고 제출하면 onSubmit이 호출된다", async () => {
    const onSubmit = vi.fn();
    render(
      <EditGroupDialog
        open={true}
        initialValues={defaultValues}
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "편집 저장하기" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          name: "테스트 모임",
          description: "테스트 설명입니다.",
        },
        expect.anything(),
      );
    });
  });
});
