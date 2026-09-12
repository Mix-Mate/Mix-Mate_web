import { setAuthTokens } from "@/shared/api/authToken";
import type { LoginResponse } from "../api/auth.api";

export function saveAuthSession(response: LoginResponse): void {
  setAuthTokens({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });

  if (typeof window !== "undefined") {
    if (response.userName) {
      window.localStorage.setItem("userName", response.userName);
    }
    if (response.userId) {
      window.localStorage.setItem("userId", String(response.userId));
    }
    if (response.email) {
      window.localStorage.setItem("email", response.email);
    }
  }
}
