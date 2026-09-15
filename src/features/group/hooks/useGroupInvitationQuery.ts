"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getGroupInvitation,
  type GroupInvitationResponse,
} from "../api/group.api";

export function useGroupInvitationQuery(
  groupId: string,
  options: { enabled?: boolean } = {},
) {
  const enabled = options.enabled ?? true;
  const requestIdRef = useRef(0);
  const [data, setData] = useState<GroupInvitationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitation = useCallback(async () => {
    if (!enabled) return null;

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const invitation = await getGroupInvitation(groupId);
      if (requestId === requestIdRef.current) setData(invitation);
      return invitation;
    } catch (queryError) {
      if (requestId === requestIdRef.current) {
        setError(
          queryError instanceof Error
            ? queryError.message
            : "초대 정보를 불러오지 못했습니다.",
        );
      }
      return null;
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [enabled, groupId]);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      return;
    }

    const requestTimer = window.setTimeout(() => {
      void fetchInvitation();
    }, 0);

    return () => window.clearTimeout(requestTimer);
  }, [enabled, fetchInvitation]);

  return {
    data: enabled ? data : null,
    isLoading: enabled ? isLoading : false,
    error: enabled ? error : null,
    refetch: fetchInvitation,
  };
}
