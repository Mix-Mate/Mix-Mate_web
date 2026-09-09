"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getTeams,
  hasSecondRoundTeams,
} from "@/features/assignment/api/assignment.api";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { getParticipants } from "@/features/participant/api/participant.api";
import {
  createParticipantRosterSheet,
  createTeamRosterSheet,
  downloadRosterExcel,
  sanitizeExcelFileBaseName,
} from "@/features/roster-download/lib/roster-excel";
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

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Excel 파일을 다운로드하지 못했습니다.";
}

export default function RosterDownloadScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { message: toastMessage, showToast } = useToast();
  const [loading, setLoading] = useState(INITIAL_LOADING_STATE);
  const [participantCounts, setParticipantCounts] = useState<
    Partial<Record<AssignmentRound, number>>
  >({});
  const [hasSecondRound, setHasSecondRound] = useState<boolean | null>(null);

  useEffect(() => {
    let ignore = false;
    const requestController = new AbortController();

    void hasSecondRoundTeams(params.groupId, requestController.signal).then(
      (result) => {
        if (!ignore) setHasSecondRound(result);
      },
    );

    return () => {
      ignore = true;
      requestController.abort();
    };
  }, [params.groupId]);

  if (!group) return null;

  const setButtonLoading = (kind: DownloadKind, value: boolean) => {
    setLoading((previous) => ({ ...previous, [kind]: value }));
  };

  const downloadParticipants = async (
    kind: DownloadKind,
    round: AssignmentRound,
  ) => {
    setButtonLoading(kind, true);

    try {
      const { participants } = await getParticipants(params.groupId, round, {
        hydrateProfiles: false,
        includeTeams: false,
      });

      if (participants.length === 0) {
        showToast(`${round}차 참가자 명단에 데이터가 없습니다.`);
        return;
      }

      await downloadRosterExcel({
        data: createParticipantRosterSheet(participants),
        fileName: `${sanitizeExcelFileBaseName(group.groupName)}_${round}차_참가자명단.xlsx`,
        sheetName: `${round}차 참가자`,
        columnWidths: [18, 24, 12],
      });
      setParticipantCounts((previous) => ({
        ...previous,
        [round]: participants.length,
      }));
    } catch (error) {
      showToast(getErrorMessage(error));
    } finally {
      setButtonLoading(kind, false);
    }
  };

  const downloadTeams = async (kind: DownloadKind, round: AssignmentRound) => {
    setButtonLoading(kind, true);

    try {
      const teams = await getTeams(params.groupId, round);
      const memberCount = teams.reduce(
        (count, team) => count + team.members.length,
        0,
      );

      if (memberCount === 0) {
        showToast(`${round}차 조 명단에 데이터가 없습니다.`);
        return;
      }

      await downloadRosterExcel({
        data: createTeamRosterSheet(teams),
        fileName: `${sanitizeExcelFileBaseName(group.groupName)}_${round}차_조명단.xlsx`,
        sheetName: `${round}차 조 명단`,
        columnWidths: [10, 18, 24],
      });
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
      <Header title="명단 다운로드" onBack={() => router.back()} />

      <main className={styles.content}>
        <section className={styles.intro} aria-labelledby="group-name">
          <h2 id="group-name">{group.groupName}</h2>
          <p>종료된 모임 · 총 {group.memberCount}명</p>
        </section>

        <InfoBanner className={styles.infoBanner}>
          <p>
            필요한 명단을 각각 Excel 파일로 받을 수 있습니다. <br />
            참가자 명단은 이름·학과·성별, 조 명단은 조번호·이름·학과 정보로
            구성됩니다.
          </p>
        </InfoBanner>

        {hasSecondRound === null && (
          <p className={styles.srOnly} role="status">
            명단 정보를 불러오는 중입니다.
          </p>
        )}

        <DownloadSection title="참가자 명단">
          <DownloadItem
            round={1}
            title="1차 술자리 참가자 명단"
            subtitle={
              participantCounts[1] === undefined
                ? "참가자 명단"
                : `${participantCounts[1]}명`
            }
            tone="participant"
            loading={loading["first-participants"]}
            onDownload={() => downloadParticipants("first-participants", 1)}
          />
          {hasSecondRound === null ? (
            <RosterDownloadCardSkeleton />
          ) : hasSecondRound ? (
            <DownloadItem
              round={2}
              title="2차 술자리 참가자 명단"
              subtitle={
                participantCounts[2] === undefined
                  ? "참가자 명단"
                  : `${participantCounts[2]}명`
              }
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
            loading={loading["first-teams"]}
            onDownload={() => downloadTeams("first-teams", 1)}
          />
          {hasSecondRound === null ? (
            <RosterDownloadCardSkeleton />
          ) : hasSecondRound ? (
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
