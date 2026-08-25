"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getGroupDetail } from "../api/group.api";
import {
  AdminGroupQueryContext,
  type AdminGroupQueryResult,
} from "../hooks/useAdminGroupQuery";
import type { GroupDetail } from "../types/group.types";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "@/features/session/components/admin-access-guard.module.css";

interface AdminGroupQueryProviderProps {
  children: ReactNode;
}

export default function AdminGroupQueryProvider({
  children,
}: AdminGroupQueryProviderProps) {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const groupId = params.groupId;
  const requestIdRef = useRef(0);
  const [data, setData] = useState<GroupDetail | null>(null);
  const [dataGroupId, setDataGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const group = await getGroupDetail(groupId);

      if (requestId === requestIdRef.current) {
        setData(group);
        setDataGroupId(groupId);
      }

      return group;
    } catch (fetchError) {
      if (requestId === requestIdRef.current) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "그룹 정보를 불러오지 못했습니다.",
        );
      }

      return null;
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    let ignore = false;
    const requestId = ++requestIdRef.current;

    async function fetchGroup() {
      setData(null);
      setDataGroupId(groupId);
      setIsLoading(true);
      setError(null);

      try {
        const group = await getGroupDetail(groupId);

        if (!ignore && requestId === requestIdRef.current) {
          setData(group);
          setDataGroupId(groupId);
        }
      } catch (fetchError) {
        if (!ignore && requestId === requestIdRef.current) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "그룹 정보를 불러오지 못했습니다.",
          );
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
    };
  }, [groupId]);

  const currentData = dataGroupId === groupId ? data : null;
  const currentIsLoading = dataGroupId !== groupId || isLoading;
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

  if (!currentData) {
    return (
      <MobileFrame
        className={styles.phone}
        fillHeight
        data-testid="admin-group-query-state"
      >
        <Header title="그룹 정보" onBack={() => router.back()} compact />

        <main className={styles.content}>
          {currentIsLoading ? (
            <p role="status">그룹 정보를 불러오는 중입니다.</p>
          ) : (
            <>
              <p className={styles.error} role="alert">
                {error ?? "그룹 정보를 불러오지 못했습니다."}
              </p>
              <Button className={styles.retryButton} onClick={refetch}>
                다시 시도
              </Button>
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
