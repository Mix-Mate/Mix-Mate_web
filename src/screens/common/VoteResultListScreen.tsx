"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import ParticipantList from "@/features/participant/components/ParticipantList";
import ParticipantPageHeader from "@/features/participant/components/ParticipantPageHeader";
import ParticipantSearch from "@/features/participant/components/ParticipantSearch";
import ParticipantStats from "@/features/participant/components/ParticipantStats";
import PrivateParticipantDialog from "@/features/participant/components/PrivateParticipantDialog";
import type { Participant } from "@/features/participant/types/participant.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { useVoteResultQuery } from "@/features/vote/hooks/useVoteResultQuery";
import type {
  MvpWinner,
  SecondRoundParticipant,
} from "@/features/vote/types/voteResult.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import MobileFrame from "@/shared/ui/MobileFrame";
import participantStyles from "./ParticipantListScreen.module.css";
import styles from "./VoteResultListScreen.module.css";

export type VoteResultListMode = "mvp" | "second-round";

interface VoteResultListScreenProps {
  mode: VoteResultListMode;
}

const gradeLabelByGrade: Record<MvpWinner["grade"], string> = {
  FIRST: "1학년",
  SECOND: "2학년",
  THIRD: "3학년",
  FOURTH: "4학년",
};

function toParticipant(
  participant: SecondRoundParticipant,
): Participant {
  return {
    id: String(participant.participantId),
    name: participant.displayName,
    department: participant.major,
    visibility:
      participant.visibility === "PUBLIC" ? "public" : "private",
    role: "general",
    gender: participant.gender === "MALE" ? "male" : "female",
  };
}

function MvpWinnerList({
  groupId,
  winners,
}: {
  groupId: string;
  winners: MvpWinner[];
}) {
  if (winners.length === 0) {
    return (
      <div className={participantStyles.emptyState}>
        <Search aria-hidden="true" size={54} strokeWidth={1.8} />
        <p>검색 결과가 없습니다</p>
      </div>
    );
  }

  return (
    <ul className={participantStyles.participantList}>
      {winners.map((winner) => (
        <li key={winner.participantId}>
          <Link
            href={`/groups/${groupId}/participants/${winner.participantId}`}
            className={participantStyles.participantItem}
          >
            <span className={styles.mvpAvatar} aria-hidden="true">
              <Image
                src="/images/vote/mvp-trophy.png"
                alt=""
                width={32}
                height={22}
              />
            </span>
            <div className={participantStyles.participantInfo}>
              <strong>{winner.displayName}</strong>
              <span>
                {winner.teamNumber}조 · {gradeLabelByGrade[winner.grade]} ·{" "}
                {winner.mbti}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function VoteResultListScreen({
  mode,
}: VoteResultListScreenProps) {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [privateParticipant, setPrivateParticipant] =
    useState<Participant | null>(null);
  const { data, isLoading, error } = useVoteResultQuery(params.groupId);

  const mvpWinners = useMemo(() => {
    const trimmedKeyword = keyword.trim();
    return (data?.mvpWinners ?? []).filter(
      (winner) =>
        !trimmedKeyword || winner.displayName.includes(trimmedKeyword),
    );
  }, [data?.mvpWinners, keyword]);

  const secondRoundParticipants = useMemo(() => {
    const trimmedKeyword = keyword.trim();
    return (data?.secondRoundParticipants ?? [])
      .map(toParticipant)
      .filter(
        (participant) =>
          !trimmedKeyword || participant.name.includes(trimmedKeyword),
      );
  }, [data?.secondRoundParticipants, keyword]);

  const isMvpList = mode === "mvp";
  const totalCount = isMvpList
    ? (data?.mvpWinners.length ?? 0)
    : (data?.secondRoundParticipants.length ?? 0);
  const title = isMvpList ? "오늘의 MVP 명단" : "2차 참가자 목록";
  const statsLabel = isMvpList ? "전체 MVP" : "전체 참가자";
  const backHref = withSessionContext(
    groupRoutes.voteResult(params.groupId),
    searchParams,
  );

  return (
    <MobileFrame
      className={participantStyles.screenFrame}
      viewportClassName={participantStyles.pageViewport}
    >
      <ParticipantPageHeader
        title={title}
        participantCount={totalCount}
        backHref={backHref}
        backLabel="투표 결과로 이동"
      />

      <div className={participantStyles.content}>
        <ParticipantSearch value={keyword} onChange={setKeyword} />
        <ParticipantStats count={totalCount} label={statsLabel} />

        <section className={participantStyles.listBox}>
          {data ? (
            isMvpList ? (
              <MvpWinnerList groupId={params.groupId} winners={mvpWinners} />
            ) : (
              <ParticipantList
                participants={secondRoundParticipants}
                onPrivateSelect={setPrivateParticipant}
              />
            )
          ) : (
            <p
              className={`${styles.queryState} ${
                error ? styles.queryError : ""
              }`}
              role={error ? "alert" : "status"}
            >
              {error ??
                (isLoading
                  ? "투표 결과를 불러오는 중입니다."
                  : "투표 결과를 불러오지 못했습니다.")}
            </p>
          )}
        </section>
      </div>

      <PrivateParticipantDialog
        participant={privateParticipant}
        onClose={() => setPrivateParticipant(null)}
      />
    </MobileFrame>
  );
}
