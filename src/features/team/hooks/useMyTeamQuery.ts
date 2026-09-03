"use client";

import { useEffect, useState } from "react";
import { getMyTeam } from "../api/team.api";
import type { MyTeamResponse, Team, TeamRound } from "../types/team.types";

interface MyTeamRequestEntry {
  controller: AbortController;
  promise: Promise<MyTeamResponse>;
  subscriberCount: number;
  abortTimer: number | null;
}

const myTeamRequests = new Map<string, MyTeamRequestEntry>();

function acquireMyTeamRequest(groupId: string, round: TeamRound) {
  const requestKey = `${groupId}:${round}`;
  let entry = myTeamRequests.get(requestKey);

  if (!entry) {
    const controller = new AbortController();
    const promise = getMyTeam(groupId, round, controller.signal).finally(() => {
      if (myTeamRequests.get(requestKey)?.promise === promise) {
        myTeamRequests.delete(requestKey);
      }
    });

    entry = {
      controller,
      promise,
      subscriberCount: 0,
      abortTimer: null,
    };
    myTeamRequests.set(requestKey, entry);
  }

  if (entry.abortTimer !== null) {
    window.clearTimeout(entry.abortTimer);
    entry.abortTimer = null;
  }
  entry.subscriberCount += 1;

  let released = false;

  return {
    promise: entry.promise,
    release() {
      if (released) return;
      released = true;
      entry.subscriberCount -= 1;

      if (entry.subscriberCount > 0) return;

      // Strict Mode의 즉시 재구독은 같은 요청을 이어받고, 실제 이탈만 취소한다.
      entry.abortTimer = window.setTimeout(() => {
        if (entry.subscriberCount > 0) return;
        entry.controller.abort();
        if (myTeamRequests.get(requestKey) === entry) {
          myTeamRequests.delete(requestKey);
        }
      }, 0);
    },
  };
}

export function useMyTeamQuery(
  groupId: string,
  round: TeamRound,
  enabled = true,
) {
  const [data, setData] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let ignore = false;
    const request = acquireMyTeamRequest(groupId, round);

    async function fetchMyTeam() {
      setData(null);
      setIsLoading(true);
      setError(null);

      try {
        const response = await request.promise;
        if (!ignore) setData(response.team);
      } catch (fetchError) {
        if (!ignore) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "내 조 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchMyTeam();

    return () => {
      ignore = true;
      request.release();
    };
  }, [enabled, groupId, round]);

  return {
    data: enabled ? data : null,
    isLoading: enabled ? isLoading : false,
    error: enabled ? error : null,
    isError: enabled && error !== null,
  };
}
