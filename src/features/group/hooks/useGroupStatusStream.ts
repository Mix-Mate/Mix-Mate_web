"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getAccessToken, subscribeAccessToken } from "@/shared/api/authToken";
import {
  GroupStatusStreamError,
  subscribeGroupStatus,
  type GroupStatusStreamOptions,
} from "../api/groupStatusStream.api";

const getServerToken = () => null;

export function useGroupStatusStream(
  groupId: string,
  {
    enabled,
    onStatus,
    onError,
  }: GroupStatusStreamOptions & { enabled: boolean },
) {
  const token = useSyncExternalStore(
    subscribeAccessToken,
    getAccessToken,
    getServerToken,
  );

  useEffect(() => {
    if (!enabled || !/^[1-9]\d*$/.test(groupId)) return;
    if (!token) {
      onError(new GroupStatusStreamError(401));
      return;
    }

    return subscribeGroupStatus(groupId, { onStatus, onError });
  }, [enabled, groupId, token, onStatus, onError]);
}
