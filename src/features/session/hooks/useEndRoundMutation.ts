"use client";

import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { endGroupRound } from "../api/session.api";

export function useEndRoundMutation() {
  return useAsyncMutation(endGroupRound, {
    fallbackErrorMessage: "술자리를 종료하지 못했습니다.",
    fallbackResult: null,
  });
}
