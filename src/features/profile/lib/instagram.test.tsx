import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GroupProfileForm from "../components/GroupProfileForm";
import {
  formatInstagramInput,
  cleanInstagramForSubmit,
  formatInstagramDisplay,
  handleInstagramInputFocus,
  handleInstagramInputBlur,
  handleInstagramInputChange,
  handleInstagramInputKeyDown,
} from "./instagram";

describe("Instagram ID Prefix & Interaction Helpers", () => {
  describe("formatInstagramInput", () => {
    it("입력값에 @가 없는 경우 맨 앞에 @를 추가한다", () => {
      expect(formatInstagramInput("my_username")).toBe("@my_username");
    });

    it("입력값에 이미 @가 있는 경우 중복되지 않고 1개만 유지한다", () => {
      expect(formatInstagramInput("@my_username")).toBe("@my_username");
      expect(formatInstagramInput("@@my_username")).toBe("@my_username");
      expect(formatInstagramInput("@@@my_username@")).toBe("@my_username");
    });

    it("빈 문자열인 경우 @를 반환한다", () => {
      expect(formatInstagramInput("")).toBe("@");
      expect(formatInstagramInput("@")).toBe("@");
    });
  });

  describe("cleanInstagramForSubmit", () => {
    it("유효한 인스타 아이디에서 @를 제거하고 순수 아이디 문자열을 반환한다", () => {
      expect(cleanInstagramForSubmit("@my_username")).toBe("my_username");
      expect(cleanInstagramForSubmit("my_username")).toBe("my_username");
    });

    it("빈 문자열, 공백 또는 @만 존재하는 경우 null을 반환한다", () => {
      expect(cleanInstagramForSubmit("@")).toBeNull();
      expect(cleanInstagramForSubmit("")).toBeNull();
      expect(cleanInstagramForSubmit("   ")).toBeNull();
      expect(cleanInstagramForSubmit(null)).toBeNull();
      expect(cleanInstagramForSubmit(undefined)).toBeNull();
    });
  });

  describe("formatInstagramDisplay", () => {
    it("기존 저장된 아이디를 @접두사를 붙여 표시용으로 포맷팅한다", () => {
      expect(formatInstagramDisplay("my_username")).toBe("@my_username");
      expect(formatInstagramDisplay("@my_username")).toBe("@my_username");
    });

    it("값이 없거나 비어 있는 경우 빈 문자열을 반환한다", () => {
      expect(formatInstagramDisplay("")).toBe("");
      expect(formatInstagramDisplay(null)).toBe("");
      expect(formatInstagramDisplay(undefined)).toBe("");
    });
  });

  describe("Focus & Blur Event Handlers", () => {
    it("Focus 시 필드가 비어 있으면 @를 자동으로 입력한다", () => {
      const onChange = vi.fn();
      handleInstagramInputFocus("", onChange);
      expect(onChange).toHaveBeenCalledWith("@");
    });

    it("Focus 시 이미 값이 있으면 onChange를 호출하지 않는다", () => {
      const onChange = vi.fn();
      handleInstagramInputFocus("@existing_id", onChange);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("Blur 시 @만 남아 있으면 placeholder 노출을 위해 빈 문자열로 초기화한다", () => {
      const onChange = vi.fn();
      handleInstagramInputBlur("@", onChange);
      expect(onChange).toHaveBeenCalledWith("");
    });

    it("Blur 시 아이디가 입력되어 있으면 초기화하지 않는다", () => {
      const onChange = vi.fn();
      handleInstagramInputBlur("@my_username", onChange);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("Change Event Handler", () => {
    it("문자를 입력하면 @접두사가 유지된 형태로 업데이트된다", () => {
      const onChange = vi.fn();
      const event = {
        target: { value: "my_user" },
      } as React.ChangeEvent<HTMLInputElement>;

      handleInstagramInputChange(event, onChange);
      expect(onChange).toHaveBeenCalledWith("@my_user");
    });

    it("사용자가 @를 중복 입력해도 @는 1개만 유지된다", () => {
      const onChange = vi.fn();
      const event = {
        target: { value: "@@@my_user" },
      } as React.ChangeEvent<HTMLInputElement>;

      handleInstagramInputChange(event, onChange);
      expect(onChange).toHaveBeenCalledWith("@my_user");
    });

    it("사용자가 전체 선택 후 삭제하여 빈 문자열이 되면 @가 유지된다", () => {
      const onChange = vi.fn();
      const event = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;

      handleInstagramInputChange(event, onChange);
      expect(onChange).toHaveBeenCalledWith("@");
    });
  });

  describe("KeyDown Event Handler (Backspace Defense)", () => {
    it("값이 @ 한 글자뿐일 때 백스페이스 입력을 방어한다", () => {
      const preventDefault = vi.fn();
      const event = {
        key: "Backspace",
        currentTarget: {
          value: "@",
          selectionStart: 1,
          selectionEnd: 1,
        },
        preventDefault,
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      handleInstagramInputKeyDown(event);
      expect(preventDefault).toHaveBeenCalled();
    });

    it("커서가 인덱스 1(@ 바로 뒤)에 위치할 때 백스페이스 입력을 방어한다", () => {
      const preventDefault = vi.fn();
      const event = {
        key: "Backspace",
        currentTarget: {
          value: "@my_user",
          selectionStart: 1,
          selectionEnd: 1,
        },
        preventDefault,
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      handleInstagramInputKeyDown(event);
      expect(preventDefault).toHaveBeenCalled();
    });

    it("커서가 인덱스 1 뒤에 있을 때는 정상적으로 백스페이스가 동작한다", () => {
      const preventDefault = vi.fn();
      const event = {
        key: "Backspace",
        currentTarget: {
          value: "@my_user",
          selectionStart: 4,
          selectionEnd: 4,
        },
        preventDefault,
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      handleInstagramInputKeyDown(event);
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("GroupProfileForm Instagram Field Integration", () => {
    it("제출 시 인스타 ID의 @ 접두사가 제거되어 서버 규격(clean string 또는 null)으로 전달된다", async () => {
      const onSubmit = vi.fn();
      const initialProfile = {
        id: "1",
        displayName: "홍길동",
        position: "MEMBER" as const,
        major: "컴퓨터공학과",
        isNew: true,
        grade: "FIRST" as const,
        gender: "MALE" as const,
        mbti: "ENFP" as const,
        age: 20,
        instaId: "existing_user",
        bio: "반갑습니다",
        visibility: "PUBLIC" as const,
      };

      render(
        <GroupProfileForm
          mode="edit"
          initialProfile={initialProfile}
          isSubmitting={false}
          submitLabel="저장하기"
          onSubmit={onSubmit}
        />,
      );

      // 1) 초기값이 @가 붙은 상태로 인풋에 렌더링되는지 확인
      const instaInput = screen.getByPlaceholderText("@아이디 입력") as HTMLInputElement;
      expect(instaInput.value).toBe("@existing_user");

      // 2) 폼 제출 시 @가 제거된 순수 문자열이 onSubmit으로 전달되는지 확인
      const submitButton = screen.getByRole("button", { name: "저장하기" });
      fireEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          instaId: "existing_user",
        }),
      );

      // 3) @만 남긴 상태에서 제출 시 null로 전달되는지 확인
      onSubmit.mockClear();
      fireEvent.change(instaInput, { target: { value: "@" } });
      fireEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          instaId: null,
        }),
      );
    });
  });
});
