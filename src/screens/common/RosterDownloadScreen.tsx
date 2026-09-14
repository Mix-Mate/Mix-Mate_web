"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { getGroupRoster } from "@/features/roster-download/api/roster.api";
import {
  createParticipantRosterSheet,
  createTeamRosterSheet,
  downloadRosterExcel,
  sanitizeExcelFileBaseName,
} from "@/features/roster-download/lib/roster-excel";
import type {
  GroupRoster,
  RosterRound,
} from "@/features/roster-download/types/roster.types";
import useToast from "@/shared/hooks/useToast";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./RosterDownloadScreen.module.css";
import { RosterDownloadCardSkeleton } from "./RosterDownloadSkeleton";

type DownloadKind =
  "first-participants" | "second-participants" | "first-teams" | "second-teams";

const INITIAL_LOADING_STATE: Record<DownloadKind, boolean> = {
  "first-participants": false,
  "second-participants": false,
  "first-teams": false,
  "second-teams": false,
};

interface RosterQueryState {
  groupId: string;
  data: GroupRoster | null;
  isLoading: boolean;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Excel 파일을 다운로드하지 못했습니다.";
}

function getRosterRound(
  roster: GroupRoster,
  round: AssignmentRound,
): RosterRound | undefined {
  const roundType = round === 1 ? "FIRST_ROUND" : "SECOND_ROUND";
  return roster.rounds.find((item) => item.round === roundType);
}

export default function RosterDownloadScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { message: toastMessage, showToast } = useToast();
  const [loading, setLoading] = useState(INITIAL_LOADING_STATE);
  const [rosterQuery, setRosterQuery] = useState<RosterQueryState>(() => ({
    groupId: params.groupId,
    data: null,
    isLoading: true,
  }));
  const isCurrentRoster = rosterQuery.groupId === params.groupId;
  const roster = isCurrentRoster ? rosterQuery.data : null;
  const isRosterLoading = !isCurrentRoster || rosterQuery.isLoading;

  useEffect(() => {
    let ignore = false;
    const requestController = new AbortController();

    void getGroupRoster(params.groupId, requestController.signal)
      .then((result) => {
        if (!ignore) {
          setRosterQuery({
            groupId: params.groupId,
            data: result,
            isLoading: false,
          });
        }
      })
      .catch((error: unknown) => {
        if (
          !ignore &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          showToast(getErrorMessage(error));
          setRosterQuery({
            groupId: params.groupId,
            data: null,
            isLoading: false,
          });
        }
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

  const loadRoster = async () => {
    if (roster) return roster;

    const result = await getGroupRoster(params.groupId);
    setRosterQuery({
      groupId: params.groupId,
      data: result,
      isLoading: false,
    });
    return result;
  };

  const downloadParticipants = async (
    kind: DownloadKind,
    round: AssignmentRound,
  ) => {
    setButtonLoading(kind, true);

    try {
      const rosterData = await loadRoster();
      const roundRoster = getRosterRound(rosterData, round);
      const members = roundRoster?.members ?? [];

      if (members.length === 0) {
        showToast(`${round}차 참가자 명단에 데이터가 없습니다.`);
        return;
      }

      await downloadRosterExcel({
        data: createParticipantRosterSheet(members),
        fileName: `${sanitizeExcelFileBaseName(rosterData.groupName)}_${round}차_참가자명단.xlsx`,
        sheetName: `${round}차 참가자`,
        columnWidths: [16, 18, 24, 12, 12],
      });
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setButtonLoading(kind, false);
    }
  };

  const downloadTeams = async (kind: DownloadKind, round: AssignmentRound) => {
    setButtonLoading(kind, true);

    try {
      const rosterData = await loadRoster();
      const roundRoster = getRosterRound(rosterData, round);
      const members = roundRoster?.members ?? [];

      if (members.length === 0) {
        showToast(`${round}차 조 명단에 데이터가 없습니다.`);
        return;
      }

      await downloadRosterExcel({
        data: createTeamRosterSheet(members),
        fileName: `${sanitizeExcelFileBaseName(rosterData.groupName)}_${round}차_조명단.xlsx`,
        sheetName: `${round}차 조 명단`,
        columnWidths: [10, 16, 18, 24, 12, 12],
      });
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setButtonLoading(kind, false);
    }
  };

  const firstRoundRoster = roster ? getRosterRound(roster, 1) : undefined;
  const secondRoundRoster = roster ? getRosterRound(roster, 2) : undefined;

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="roster-download-screen"
    >
      <Header title="명단 다운로드" onBack={() => router.back()} />

      <main className={styles.content}>
        <section className={styles.intro} aria-labelledby="group-name">
          <h2 id="group-name">{group.groupName}</h2>
          <p>종료된 모임 · 총 {group.memberCount}명</p>
        </section>

        <InfoBanner className={styles.infoBanner}>
          <p>
            필요한 명단을 각각 Excel 파일로 받을 수 있습니다. <br />
            참가자 명단은 학번·이름·학과·학년·성별, 조 명단은 조번호를 포함한
            동일 정보로 구성됩니다.
          </p>
        </InfoBanner>

        {isRosterLoading && (
          <p className={styles.srOnly} role="status">
            명단 정보를 불러오는 중입니다.
          </p>
        )}

        <DownloadSection title="참가자 명단">
          <DownloadItem
            round={1}
            title="1차 술자리 참가자 명단"
            subtitle={
              firstRoundRoster === undefined
                ? "참가자 명단"
                : `${firstRoundRoster.members.length}명`
            }
            tone="participant"
            loading={isRosterLoading || loading["first-participants"]}
            onDownload={() => downloadParticipants("first-participants", 1)}
          />
          {isRosterLoading ? (
            <RosterDownloadCardSkeleton />
          ) : secondRoundRoster ? (
            <DownloadItem
              round={2}
              title="2차 술자리 참가자 명단"
              subtitle={`${secondRoundRoster.members.length}명`}
              tone="participant"
              loading={loading["second-participants"]}
              onDownload={() => downloadParticipants("second-participants", 2)}
            />
          ) : null}
        </DownloadSection>

        <DownloadSection title="조 명단">
          <DownloadItem
            round={1}
            title="1차 조 명단"
            subtitle="조 편성 파일"
            tone="team"
            loading={isRosterLoading || loading["first-teams"]}
            onDownload={() => downloadTeams("first-teams", 1)}
          />
          {isRosterLoading ? (
            <RosterDownloadCardSkeleton />
          ) : secondRoundRoster ? (
            <DownloadItem
              round={2}
              title="2차 조 명단"
              subtitle="조 편성 파일"
              tone="team"
              loading={loading["second-teams"]}
              onDownload={() => downloadTeams("second-teams", 2)}
            />
          ) : null}
        </DownloadSection>
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
  tone,
  loading,
  onDownload,
}: {
  round: AssignmentRound;
  title: string;
  subtitle: string;
  tone: "participant" | "team";
  loading: boolean;
  onDownload: () => void;
}) {
  return (
    <article className={styles.downloadItem}>
      <span
        className={`${styles.roundBadge} ${
          tone === "participant" ? styles.participantBadge : styles.teamBadge
        }`}
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
        disabled={loading}
        aria-busy={loading}
        aria-label={`${title} Excel 다운로드`}
        onClick={onDownload}
      >
        {loading ? "처리 중" : "Excel ↓"}
      </button>
    </article>
  );
}

