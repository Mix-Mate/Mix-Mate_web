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
  const [dataGroupId, setDataGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isExtraPage);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    status?: number;
    code?: string;
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
          });
        } else if (fetchError instanceof Error) {
          setErrorInfo({
            message: fetchError.message,
            status: (fetchError as { status?: number }).status,
            code: (fetchError as { code?: string }).code,
          });
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
            });
          } else if (fetchError instanceof Error) {
            setErrorInfo({
              message: fetchError.message,
              status: (fetchError as { status?: number }).status,
              code: (fetchError as { code?: string }).code,
            });
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
      }
    },
    [router],
  );

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
        <Header
          title="그룹 정보"
          onBack={() => (backHref ? router.replace(backHref) : router.back())}
          compact
        />

        <main className={styles.content}>
          {currentIsLoading ? (
            <p role="status">그룹 정보를 불러오는 중입니다.</p>
          ) : (
            <>
              <p className={styles.error} role="alert">
                {error ?? "그룹 정보를 불러오지 못했습니다."}
              </p>
              {isBlocked ? (
                <Button
                  className={styles.retryButton}
                  onClick={() => router.replace(appRoutes.home())}
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
