"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getGroupDetail, GroupApiError } from "../api/group.api";
import {
  AdminGroupQueryContext,
  type AdminGroupQueryResult,
} from "../hooks/useAdminGroupQuery";
import type { GroupDetail, GroupStatusEvent } from "../types/group.types";
import type { GroupStatusStreamError } from "../api/groupStatusStream.api";
import { useGroupStatusStream } from "../hooks/useGroupStatusStream";
import { isGroupHomeRoute } from "../lib/group-entry-route";
import GroupHomeHeader from "@/features/session/components/GroupHomeHeader";
import {
  recordBlockedGroup,
  getKnownGroupName,
  isDummyGroupName,
  undismissBlockedGroup,
} from "@/features/blacklist/lib/blockedGroupsStorage";
import { checkUserBlockedInGroup } from "@/features/blacklist/api/blacklist.api";
import { clearAuthTokens } from "@/shared/api/authToken";
import {
  appRoutes,
  authRoutes,
  groupRoutes,
} from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "@/features/session/components/admin-access-guard.module.css";

interface AdminGroupQueryProviderProps {
  children: ReactNode;
}

function mergeStreamStatus(
  group: GroupDetail,
  snapshotAtRequest: GroupStatusEvent | null,
  latestSnapshot: GroupStatusEvent | null,
): GroupDetail {
  // REST 요청 도중 받은 SSE 상태를 늦은 응답이 덮어쓰지 않게 한다.
  if (
    latestSnapshot !== snapshotAtRequest &&
    latestSnapshot?.groupId === group.groupId
  ) {
    return { ...group, status: latestSnapshot.status };
  }
  return group;
}

function getResolvedBlockedGroupName(
  groupId: string,
  dataName?: string,
  errName?: string,
): string {
  if (dataName && !isDummyGroupName(dataName)) {
    return dataName;
  }
  if (errName && !isDummyGroupName(errName)) {
    return errName;
  }
  const known = getKnownGroupName(groupId);
  if (known && !isDummyGroupName(known)) {
    return known;
  }
  if (typeof window !== "undefined") {
    if (window.location && window.location.search) {
      try {
        const sp = new URLSearchParams(window.location.search);
        const qName = sp.get("groupName") || sp.get("name");
        if (qName && !isDummyGroupName(qName)) {
          return qName.trim();
        }
      } catch {
        // ignore
      }
    }
    const pending = window.sessionStorage.getItem("pendingGroupName");
    if (pending && !isDummyGroupName(pending)) {
      return pending.trim();
    }
  }
  return "그룹";
}

export default function AdminGroupQueryProvider({
  children,
}: AdminGroupQueryProviderProps) {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const isExtraPage = pathname?.includes("/extra");
  const groupId = params.groupId;
  const requestIdRef = useRef(0);
  const latestStatusRef = useRef<GroupStatusEvent | null>(null);
  const [data, setData] = useState<GroupDetail | null>(null);
  const dataRef = useRef<GroupDetail | null>(null);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  const [dataGroupId, setDataGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isExtraPage);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    status?: number;
    code?: string;
    reason?: string;
  } | null>(null);

  const error = errorInfo?.message ?? null;

  const isBlocked = useMemo(() => {
    if (!errorInfo) return false;
    if (errorInfo.status === 403) return true;
    if (
      errorInfo.code === "USER_BLOCKED" ||
      errorInfo.code === "BANNED_USER" ||
      errorInfo.code === "FORBIDDEN" ||
      errorInfo.code === "BLOCKED"
    ) {
      return true;
    }
    const msg = errorInfo.message || "";
    return msg.includes("차단") || msg.includes("참여하고 있지 않습니다");
  }, [errorInfo]);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const snapshotAtRequest = latestStatusRef.current;
    setErrorInfo(null);

    try {
      const group = mergeStreamStatus(
        await getGroupDetail(groupId),
        snapshotAtRequest,
        latestStatusRef.current,
      );

      if (requestId === requestIdRef.current) {
        setData(group);
        setDataGroupId(groupId);
      }

      return group;
    } catch (fetchError) {
      if (requestId === requestIdRef.current) {
        if (fetchError instanceof GroupApiError) {
          setErrorInfo({
            message: fetchError.message,
            status: fetchError.status,
            code: fetchError.code,
            reason: fetchError.reason,
          });
          if (
            fetchError.status === 403 ||
            fetchError.code === "USER_BLOCKED" ||
            fetchError.code === "BANNED_USER" ||
            fetchError.code === "FORBIDDEN" ||
            fetchError.code === "BLOCKED" ||
            fetchError.message.includes("차단") ||
            fetchError.message.includes("참여하고 있지 않습니다")
          ) {
            undismissBlockedGroup(groupId);
            recordBlockedGroup({
              groupId: String(groupId),
              groupName: getResolvedBlockedGroupName(
                groupId,
                dataRef.current?.groupName,
                fetchError.groupName,
              ),
              reason: fetchError.reason,
            });
          }
        } else if (fetchError instanceof Error) {
          const status = (fetchError as { status?: number }).status;
          const code = (fetchError as { code?: string }).code;
          const reason = (fetchError as { reason?: string }).reason;
          const errGroupName = (fetchError as { groupName?: string }).groupName;
          setErrorInfo({
            message: fetchError.message,
            status,
            code,
            reason,
          });
          if (
            status === 403 ||
            code === "USER_BLOCKED" ||
            code === "BANNED_USER" ||
            code === "FORBIDDEN" ||
            code === "BLOCKED" ||
            fetchError.message.includes("차단") ||
            fetchError.message.includes("참여하고 있지 않습니다")
          ) {
            undismissBlockedGroup(groupId);
            recordBlockedGroup({
              groupId: String(groupId),
              groupName: getResolvedBlockedGroupName(
                groupId,
                dataRef.current?.groupName,
                errGroupName,
              ),
              reason,
            });
          }
        } else {
          setErrorInfo({
            message: "그룹 정보를 불러오지 못했습니다.",
          });
        }
      }

      return null;
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (isExtraPage) return;

    let ignore = false;
    const requestId = ++requestIdRef.current;
    const snapshotAtRequest = latestStatusRef.current;

    async function fetchGroup() {
      setData((prev) => (prev?.groupId === Number(groupId) ? prev : null));
      setDataGroupId(groupId);
      setIsLoading(true);
      setErrorInfo(null);

      try {
        const group = mergeStreamStatus(
          await getGroupDetail(groupId),
          snapshotAtRequest,
          latestStatusRef.current,
        );

        if (!ignore && requestId === requestIdRef.current) {
          setData(group);
          setDataGroupId(groupId);
        }
      } catch (fetchError) {
        if (!ignore && requestId === requestIdRef.current) {
          if (fetchError instanceof GroupApiError) {
            setErrorInfo({
              message: fetchError.message,
              status: fetchError.status,
              code: fetchError.code,
              reason: fetchError.reason,
            });
            if (
              fetchError.status === 403 ||
              fetchError.code === "USER_BLOCKED" ||
              fetchError.code === "BANNED_USER" ||
              fetchError.code === "FORBIDDEN" ||
              fetchError.code === "BLOCKED" ||
              fetchError.message.includes("차단") ||
              fetchError.message.includes("참여하고 있지 않습니다")
            ) {
              undismissBlockedGroup(groupId);
              recordBlockedGroup({
                groupId: String(groupId),
                groupName: getResolvedBlockedGroupName(
                  groupId,
                  dataRef.current?.groupName,
                  fetchError.groupName,
                ),
                reason: fetchError.reason,
              });
            }
          } else if (fetchError instanceof Error) {
            const status = (fetchError as { status?: number }).status;
            const code = (fetchError as { code?: string }).code;
            const reason = (fetchError as { reason?: string }).reason;
            const errGroupName = (fetchError as { groupName?: string }).groupName;
            setErrorInfo({
              message: fetchError.message,
              status,
              code,
              reason,
            });
            if (
              status === 403 ||
              code === "USER_BLOCKED" ||
              code === "BANNED_USER" ||
              code === "FORBIDDEN" ||
              code === "BLOCKED" ||
              fetchError.message.includes("차단") ||
              fetchError.message.includes("참여하고 있지 않습니다")
            ) {
              undismissBlockedGroup(groupId);
              recordBlockedGroup({
                groupId: String(groupId),
                groupName: getResolvedBlockedGroupName(
                  groupId,
                  dataRef.current?.groupName,
                  errGroupName,
                ),
                reason,
              });
            }
          } else {
            setErrorInfo({
              message: "그룹 정보를 불러오지 못했습니다.",
            });
          }
        }
      } finally {
        if (!ignore && requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }

    void fetchGroup();

    return () => {
      ignore = true;
      requestIdRef.current += 1;
    };
  }, [groupId, isExtraPage]);

  const currentData = dataGroupId === groupId ? data : null;
  const currentIsLoading = isExtraPage
    ? false
    : dataGroupId !== groupId || isLoading;

  const onStatus = useCallback(
    (event: GroupStatusEvent) => {
      if (event.groupId !== Number(groupId)) return;
      latestStatusRef.current = event;
      setData((previous) =>
        previous?.groupId === event.groupId && previous.status !== event.status
          ? { ...previous, status: event.status }
          : previous,
      );
    },
    [groupId],
  );

  const onStreamError = useCallback(
    (streamError: GroupStatusStreamError) => {
      requestIdRef.current += 1;
      const currentGroupName = dataRef.current?.groupName;
      setData(null);
      setIsLoading(false);
      setErrorInfo({
        message: streamError.message,
        status: streamError.status,
      });

      if (streamError.status === 401) {
        clearAuthTokens();
        window.sessionStorage.setItem("authToast", streamError.message);
        router.replace(authRoutes.login());
        return;
      }

      if (
        streamError.status === 403 ||
        streamError.message.includes("차단") ||
        streamError.message.includes("참여하고 있지 않습니다")
      ) {
        undismissBlockedGroup(groupId);
        const resolvedName = getResolvedBlockedGroupName(
          groupId,
          currentGroupName,
        );
        recordBlockedGroup({
          groupId: String(groupId),
          groupName: resolvedName,
        });

        void checkUserBlockedInGroup(groupId).then((blocked) => {
          if (blocked?.reason) {
            undismissBlockedGroup(groupId);
            recordBlockedGroup({
              groupId: String(groupId),
              groupName: resolvedName,
              reason: blocked.reason,
            });
            setErrorInfo((prev) =>
              prev
                ? {
                    ...prev,
                    reason: blocked.reason,
                    code: "USER_BLOCKED",
                  }
                : prev,
            );
          }
        });
      }
    },
    [groupId, router],
  );

  // 멀티탭 환경에서 관리자가 참가자를 차단할 때 실시간 storage 변경 감지
  useEffect(() => {
    if (typeof window === "undefined" || !groupId) return;

    const handleStorageChange = async (event: StorageEvent) => {
      if (
        event.key === `mixmate:group-blacklist:${groupId}` ||
        event.key === `mixmate_blacklist_${groupId}` ||
        event.key === "mixmate_blocked_groups"
      ) {
        const blocked = await checkUserBlockedInGroup(groupId);
        if (blocked) {
          undismissBlockedGroup(groupId);
          const resolvedName = getResolvedBlockedGroupName(
            groupId,
            dataRef.current?.groupName,
          );
          recordBlockedGroup({
            groupId: String(groupId),
            groupName: resolvedName,
            reason: blocked.reason,
          });
          setErrorInfo({
            message: blocked.reason
              ? `그룹에서 차단되었습니다.\n차단 사유: ${blocked.reason}`
              : "이 그룹에 참여하고 있지 않거나 차단되었습니다.",
            status: 403,
            code: "USER_BLOCKED",
            reason: blocked.reason,
          });
          setData(null);
          setIsLoading(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [groupId]);

  // 차단 상태 감지 시 로컬 스토리지 동기화 보장
  useEffect(() => {
    if (isBlocked && groupId) {
      undismissBlockedGroup(groupId);
      const resolvedName = getResolvedBlockedGroupName(
        groupId,
        dataRef.current?.groupName,
      );
      recordBlockedGroup({
        groupId: String(groupId),
        groupName: resolvedName,
        reason: errorInfo?.reason,
      });
    }
  }, [isBlocked, groupId, errorInfo?.reason]);

  const handleGoHome = useCallback(() => {
    if (groupId) {
      undismissBlockedGroup(groupId);
      const resolvedName = getResolvedBlockedGroupName(
        groupId,
        dataRef.current?.groupName,
      );
      recordBlockedGroup({
        groupId: String(groupId),
        groupName: resolvedName,
        reason: errorInfo?.reason,
      });
    }
    router.replace(appRoutes.home());
  }, [groupId, errorInfo?.reason, router]);

  useGroupStatusStream(groupId, {
    enabled: !isExtraPage && currentData !== null,
    onStatus,
    onError: onStreamError,
  });

  const value = useMemo<AdminGroupQueryResult>(
    () => ({
      groupId,
      data: currentData,
      isLoading: currentIsLoading,
      isError: error !== null,
      error,
      refetch,
    }),
    [currentData, currentIsLoading, error, groupId, refetch],
  );

  if (!currentData && !isExtraPage) {
    const backHref =
      pathname === groupRoutes.mvpVote(groupId)
        ? appRoutes.home()
        : pathname === groupRoutes.attendanceVote(groupId)
          ? groupRoutes.mvpVote(groupId)
          : null;

    return (
      <MobileFrame
        className={styles.phone}
        data-testid="admin-group-query-state"
      >
        {isGroupHomeRoute(pathname, groupId) ||
        backHref === appRoutes.home() ? (
          <GroupHomeHeader title="그룹 정보" compact />
        ) : (
          <Header
            title="그룹 정보"
            onBack={() => (backHref ? router.replace(backHref) : router.back())}
            compact
          />
        )}

        <main className={styles.content}>
          {currentIsLoading ? (
            <p role="status">그룹 정보를 불러오는 중입니다.</p>
          ) : (
            <>
              <p className={styles.error} role="alert">
                {isBlocked && errorInfo?.reason
                  ? `그룹에서 차단되었습니다.\n차단 사유: ${errorInfo.reason}`
                  : (error ?? "그룹 정보를 불러오지 못했습니다.")}
              </p>
              {isBlocked ? (
                <Button
                  className={styles.retryButton}
                  onClick={handleGoHome}
                >
                  홈으로 이동
                </Button>
              ) : (
                <Button className={styles.retryButton} onClick={refetch}>
                  다시 시도
                </Button>
              )}
            </>
          )}
        </main>
      </MobileFrame>
    );
  }

  return (
    <AdminGroupQueryContext.Provider value={value}>
      {children}
    </AdminGroupQueryContext.Provider>
  );
}
