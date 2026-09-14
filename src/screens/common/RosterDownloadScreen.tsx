"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toBackendRound } from "@/features/assignment/model/assignment.mapper";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { getGroupStatusLabel } from "@/features/group/model/group-status";
import { getRoster } from "@/features/roster-download/api/roster.api";
import {
  createRosterSheet,
  downloadRosterExcel,
  sanitizeExcelFileBaseName,
} from "@/features/roster-download/lib/roster-excel";
import type {
  RosterMember,
  RosterResponse,
} from "@/features/roster-download/types/roster.types";
import useToast from "@/shared/hooks/useToast";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./RosterDownloadScreen.module.css";
import { RosterDownloadCardSkeleton } from "./RosterDownloadSkeleton";

type DownloadKind = "first" | "second";

const INITIAL_LOADING_STATE: Record<DownloadKind, boolean> = {
  first: false,
  second: false,
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Excel 파일을 다운로드하지 못했습니다.";
}

function getRoundMembers(
  roster: RosterResponse | null,
  round: AssignmentRound,
): RosterMember[] {
  if (!roster) return [];
  const backendRound = toBackendRound(round);
  return (
    roster.rounds.find((entry) => entry.round === backendRound)?.members ?? []
  );
}

function rosterKind(round: AssignmentRound): DownloadKind {
  return round === 1 ? "first" : "second";
}

function getFocusedRound(roundParam: string | null): AssignmentRound | null {
  if (roundParam === "1") return 1;
  if (roundParam === "2") return 2;
  return null;
}

export default function RosterDownloadScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusedRound = getFocusedRound(searchParams.get("round"));
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { message: toastMessage, showToast } = useToast();
  const [loading, setLoading] = useState(INITIAL_LOADING_STATE);
  const [participantCounts, setParticipantCounts] = useState<
    Partial<Record<AssignmentRound, number>>
  >({});
  const [roster, setRoster] = useState<RosterResponse | null>(null);
  const hasSecondRound = roster
    ? roster.rounds.some((entry) => entry.round === "SECOND_ROUND")
    : null;

  useEffect(() => {
    let ignore = false;
    const requestController = new AbortController();

    getRoster(params.groupId, requestController.signal)
      .then((data) => {
        if (!ignore) setRoster(data);
      })
      .catch((error) => {
        if (!ignore) showToast(getErrorMessage(error));
      });

    return () => {
      ignore = true;
      requestController.abort();
    };
  }, [params.groupId, showToast]);

  if (!group) return null;

  const setButtonLoading = (kind: DownloadKind, value: boolean) => {
    setLoading((previous) => ({ ...previous, [kind]: value }));
  };

  const downloadRoster = async (kind: DownloadKind, round: AssignmentRound) => {
    setButtonLoading(kind, true);

    try {
      const members = getRoundMembers(roster, round);

      if (members.length === 0) {
        showToast(`${round}차 명단에 데이터가 없습니다.`);
        return;
      }

      await downloadRosterExcel({
        data: createRosterSheet(members),
        fileName: `${sanitizeExcelFileBaseName(group.groupName)}_${round}차_명단.xlsx`,
        sheetName: `${round}차 명단`,
        columnWidths: [10, 14, 18, 24, 12],
      });
      setParticipantCounts((previous) => ({
        ...previous,
        [round]: members.length,
      }));
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setButtonLoading(kind, false);
    }
  };

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="roster-download-screen"
    >
      <Header
        title={focusedRound ? `${focusedRound}차 명단 다운로드` : "명단 다운로드"}
        onBack={() => router.back()}
      />

      <main className={styles.content}>
        <section className={styles.intro} aria-labelledby="group-name">
          <h2 id="group-name">{group.groupName}</h2>
          <p>
            {getGroupStatusLabel(group.status)} · 총 {group.memberCount}명
          </p>
        </section>

        <InfoBanner className={styles.infoBanner}>
          <p>
            명단을 Excel 파일로 받을 수 있습니다. <br />
            조번호·학번·이름·학과·성별 정보로 구성됩니다.
          </p>
        </InfoBanner>

        {roster === null && (
          <p className={styles.srOnly} role="status">
            명단 정보를 불러오는 중입니다.
          </p>
        )}

        {focusedRound ? (
          <DownloadSection title="명단">
            <DownloadItem
              round={focusedRound}
              title={`${focusedRound}차 술자리 명단`}
              subtitle={
                participantCounts[focusedRound] === undefined
                  ? "전체 명단"
                  : `${participantCounts[focusedRound]}명`
              }
              loading={loading[rosterKind(focusedRound)]}
              disabled={roster === null}
              onDownload={() =>
                downloadRoster(rosterKind(focusedRound), focusedRound)
              }
            />
          </DownloadSection>
        ) : (
          <DownloadSection title="명단">
            <DownloadItem
              round={1}
              title="1차 술자리 명단"
              subtitle={
                participantCounts[1] === undefined
                  ? "전체 명단"
                  : `${participantCounts[1]}명`
              }
              loading={loading.first}
              disabled={roster === null}
              onDownload={() => downloadRoster("first", 1)}
            />
            {hasSecondRound === null ? (
              <RosterDownloadCardSkeleton />
            ) : hasSecondRound ? (
              <DownloadItem
                round={2}
                title="2차 술자리 명단"
                subtitle={
                  participantCounts[2] === undefined
                    ? "전체 명단"
                    : `${participantCounts[2]}명`
                }
                loading={loading.second}
                onDownload={() => downloadRoster("second", 2)}
              />
            ) : null}
          </DownloadSection>
        )}
      </main>

      {toastMessage && <Toast className={styles.toast}>{toastMessage}</Toast>}
    </MobileFrame>
  );
}

function DownloadSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.downloadSection} aria-label={title}>
      <h3>{title}</h3>
      <div className={styles.downloadList}>{children}</div>
    </section>
  );
}

function DownloadItem({
  round,
  title,
  subtitle,
  loading,
  disabled,
  onDownload,
}: {
  round: AssignmentRound;
  title: string;
  subtitle: string;
  loading: boolean;
  disabled?: boolean;
  onDownload: () => void;
}) {
  return (
    <article className={styles.downloadItem}>
      <span
        className={`${styles.roundBadge} ${styles.participantBadge}`}
        aria-hidden="true"
      >
        {round}차
      </span>
      <div className={styles.fileInfo}>
        <h4>{title}</h4>
        <p>{subtitle}</p>
      </div>
      <button
        type="button"
        className={styles.downloadButton}
        disabled={loading || disabled}
        aria-busy={loading}
        aria-label={`${title} Excel 다운로드`}
        onClick={onDownload}
      >
        {loading ? "처리 중" : "Excel ↓"}
      </button>
    </article>
  );
}
