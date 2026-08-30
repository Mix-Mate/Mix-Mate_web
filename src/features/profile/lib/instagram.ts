import type React from "react";

/**
 * 사용자 입력값에서 모든 '@'를 제거하고 맨 앞에 단 1개의 '@'만 유지하도록 포맷팅합니다.
 * - "my_id" -> "@my_id"
 * - "@my_id" -> "@my_id"
 * - "@@my_id" -> "@my_id"
 * - "" -> "@"
 */
export function formatInstagramInput(value: string): string {
  const clean = value.replace(/@/g, "").trim();
  return clean ? `@${clean}` : "@";
}

/**
 * 서버로 데이터를 전송(Form Submit)할 때 Instagram ID를 정제합니다.
 * - 빈 문자열이나 "@"만 있는 경우: null 반환
 * - "@my_id" -> "my_id"
 * - "my_id" -> "my_id"
 */
export function cleanInstagramForSubmit(
  value?: string | null,
): string | null {
  if (!value) return null;
  const clean = value.replace(/@/g, "").trim();
  return clean.length > 0 ? clean : null;
}

/**
 * 초기값 또는 조회된 인스타 ID를 인풋 표시용으로 포맷팅합니다.
 * - "my_id" -> "@my_id"
 * - "@my_id" -> "@my_id"
 * - null / undefined / "" -> ""
 */
export function formatInstagramDisplay(
  value?: string | null,
): string {
  if (!value) return "";
  const clean = value.replace(/@/g, "").trim();
  return clean ? `@${clean}` : "";
}

/**
 * 인풋 onChange 핸들러
 */
export function handleInstagramInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: string) => void,
) {
  const rawValue = e.target.value;
  // 사용자가 전체 선택 후 삭제하여 빈 문자열이 된 경우에도 '@' 유지
  if (!rawValue) {
    onChange("@");
    return;
  }
  const clean = rawValue.replace(/@/g, "");
  onChange(clean ? `@${clean}` : "@");
}

/**
 * 인풋 onFocus 핸들러: 비어 있는 경우 자동으로 '@'를 채움
 */
export function handleInstagramInputFocus(
  value: string,
  onChange: (value: string) => void,
) {
  if (!value || value === "") {
    onChange("@");
  }
}

/**
 * 인풋 onBlur 핸들러: '@'만 남아 있는 경우 placeholder가 보이도록 빈 문자열로 정리
 */
export function handleInstagramInputBlur(
  value: string,
  onChange: (value: string) => void,
) {
  if (value === "@" || value.trim() === "") {
    onChange("");
  }
}

/**
 * 인풋 onKeyDown 핸들러: 백스페이스로 '@'가 지워지는 것을 방어
 */
export function handleInstagramInputKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
) {
  const input = e.currentTarget;
  const { selectionStart, selectionEnd, value } = input;

  if (e.key === "Backspace") {
    // 1) 값이 '@' 한 글자뿐인 경우 삭제 차단
    if (value === "@") {
      e.preventDefault();
      return;
    }

    // 2) 커서가 맨 앞 '@' 바로 뒤(인덱스 1)에 있고 드래그 선택이 없을 때 Backspace 입력 차단
    if (selectionStart === 1 && selectionEnd === 1) {
      e.preventDefault();
      return;
    }

    // 3) 맨 앞의 '@'를 포함하여 전체 드래그 선택 후 백스페이스를 누른 경우 '@'만 남기도록 처리
    if (selectionStart === 0 && selectionEnd === value.length) {
      e.preventDefault();
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeSetter?.call(input, "@");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.setSelectionRange(1, 1);
    }
  }
}
