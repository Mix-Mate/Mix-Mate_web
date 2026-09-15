import { beforeEach, describe, expect, it } from "vitest";
import {
  consumePostLoginRedirect,
  getPostLoginRedirect,
  normalizePostLoginRedirect,
  POST_LOGIN_REDIRECT_KEY,
  rememberPostLoginRedirect,
} from "./post-login-redirect";

describe("post-login redirect", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("앱 내부 초대 링크를 저장하고 한 번만 사용한다", () => {
    const invitePath = "/groups/join?inviteCode=ABC123";

    expect(rememberPostLoginRedirect(invitePath)).toBe(invitePath);
    expect(getPostLoginRedirect()).toBe(invitePath);
    expect(consumePostLoginRedirect()).toBe(invitePath);
    expect(getPostLoginRedirect()).toBeNull();
  });

  it.each([
    "https://evil.example/groups/join?inviteCode=ABC123",
    "//evil.example/groups/join?inviteCode=ABC123",
    "/\\evil.example/groups/join?inviteCode=ABC123",
  ])("외부 이동으로 해석될 수 있는 주소를 거부한다: %s", (candidate) => {
    window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, "/home");

    expect(normalizePostLoginRedirect(candidate)).toBeNull();
    expect(rememberPostLoginRedirect(candidate)).toBeNull();
    expect(getPostLoginRedirect()).toBeNull();
  });
});
