"use client";

import { CircleCheck, Info, UsersRound } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getMockGroupRole,
  withSessionContext,
} from "@/features/session/utils/session-navigation";
import { useEndVoteMutation } from "@/features/vote/hooks/useEndVoteMutation";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import EndVoteDialog from "@/modals/admin/EndVoteDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./EndVoteScreen.module.css";

export default function EndVoteScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = getMockGroupRole(searchParams) === "ADMIN";
  const { data, isLoading, error: voteStatusError } = useVoteStatusQuery(
    params.groupId,
  );
  const {
    mutate: endVote,
    isPending: isEndingVote,
    error: endVoteError,
  } = useEndVoteMutation();
  const [endVoteDialogOpen, setEndVoteDialogOpen] = useState(false);

  const showVoteStatus = useCallback(() => {
    router.push(
      withSessionContext(groupRoutes.voteStatus(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  useEffect(() => {
    if (!isAdmin) showVoteStatus();
  }, [isAdmin, showVoteStatus]);

  const closeEndVoteDialog = useCallback(() => {
    if (!isEndingVote) setEndVoteDialogOpen(false);
  }, [isEndingVote]);

  const confirmEndVote = useCallback(async () => {
    const didEnd = await endVote(params.groupId);
    if (!didEnd) return;

    setEndVoteDialogOpen(false);
    router.replace(
      withSessionContext(groupRoutes.voteResult(params.groupId), searchParams),
    );
  }, [endVote, params.groupId, router, searchParams]);

  if (!isAdmin) return null;

  if (!data) {
    return (
      <MobileFrame
        className={styles.phone}
        data-testid="admin-vote-end-screen"
        data-group-id={params.groupId}
        data-role="ADMIN"
      >
        <Header title="투표 종료" onBack={showVoteStatus} />
        <div className={styles.content}>
          <p
            className={`${styles.queryState} ${
              voteStatusError ? styles.queryError : ""
            }`}
            role={voteStatusError ? "alert" : "status"}
          >
            {voteStatusError ??
              (isLoading
                ? "투표 현황을 불러오는 중입니다."
                : "투표 현황을 불러오지 못했습니다.")}
          </p>
        </div>
      </MobileFrame>
    );
  }

  const pendingMembers = data.participants.filter(
    (participant) => participant.choice === null,
  );

  return (
    <MobileFrame
      className={styles.phone}
      data-testid="admin-vote-end-screen"
      data-group-id={params.groupId}
      data-role="ADMIN"
    >
      <Header title="투표 종료" onBack={showVoteStatus} />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>종료 시 확정되는 정보</h2>

        <div className={styles.summaryList}>
          <section className={styles.summaryCard} aria-label="2차 참여자">
            <span className={styles.summaryIcon} aria-hidden="true">
              <UsersRound size={24} strokeWidth={1.8} />
            </span>
            <div className={styles.summaryContent}>
              <span className={styles.summaryValue}>
                <small>2차 참여자</small>
                <strong>{data.participateCount}명</strong>
              </span>
              <span className={styles.summaryDescription}>참여 선택 인원</span>
            </div>
          </section>

          <section className={styles.summaryCard} aria-label="투표 완료">
            <span className={styles.summaryIcon} aria-hidden="true">
              <CircleCheck size={24} strokeWidth={1.8} />
            </span>
            <div className={styles.summaryContent}>
              <span className={styles.summaryValue}>
                <small>투표 완료</small>
                <strong>
                  {data.votedCount} / {data.totalParticipantCount}
                </strong>
              </span>
              <span className={styles.summaryDescription}>
                전체 대비 완료 인원
              </span>
            </div>
          </section>
        </div>

        <section className={styles.infoCard} aria-labelledby="mvp-info-title">
          <Info aria-hidden="true" size={17} strokeWidth={1.9} />
          <div>
            <h2 id="mvp-info-title">MVP 결과 처리 안내</h2>
            <p>
              MVP 결과는 <strong>오늘의 분위기 메이커</strong>로 공개됩니다.
              <br />
              동점자가 여러 명이면 모두 공동 MVP로 선정합니다.
            </p>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={showVoteStatus}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.endButton}
          onClick={() => setEndVoteDialogOpen(true)}
        >
          투표 종료하기
        </button>
      </footer>

      <EndVoteDialog
        open={endVoteDialogOpen}
        pendingMembers={pendingMembers}
        isEnding={isEndingVote}
        error={endVoteError}
        onClose={closeEndVoteDialog}
        onConfirm={confirmEndVote}
      />
    </MobileFrame>
  );
}
