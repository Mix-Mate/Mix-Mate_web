"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import ParticipantList from "@/features/participant/components/ParticipantList";
import ParticipantSearch from "@/features/participant/components/ParticipantSearch";
import ParticipantStats from "@/features/participant/components/ParticipantStats";
import PrivateParticipantDialog from "@/features/participant/components/PrivateParticipantDialog";
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
import { resolveMyParticipantId } from "@/features/participant/model/enrich-participant-with-my-profile";
import type { Participant } from "@/features/participant/types/participant.types";
import { useMyGroupProfileQuery } from "@/features/profile/hooks/useMyGroupProfileQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { useVoteResultQuery } from "@/features/vote/hooks/useVoteResultQuery";
import type {
  MvpWinner,
  SecondRoundParticipant,
} from "@/features/vote/types/voteResult.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
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
  OTHER: "기타",
};

function toParticipant(
  participant: SecondRoundParticipant,
  detailedParticipant?: Participant,
): Participant {
  if (detailedParticipant) {
    return detailedParticipant;
  }

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
  canViewPrivateProfiles,
  groupId,
  searchParams,
  winners,
}: {
  canViewPrivateProfiles: boolean;
  groupId: string;
  searchParams: { get: (key: string) => string | null };
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
      {winners.map((winner) => {
        const profileSearchParams = new URLSearchParams({ list: "mvp" });

        if (canViewPrivateProfiles) {
          profileSearchParams.set("role", "admin");
        }

        const profileHref = withSessionContext(
          `/groups/${groupId}/participants/${winner.participantId}?${profileSearchParams}`,
          searchParams,
        );

        return (
          <li key={winner.participantId}>
            <Link
              href={profileHref}
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
        );
      })}
    </ul>
  );
}

export default function VoteResultListScreen({
  mode,
}: VoteResultListScreenProps) {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [privateParticipant, setPrivateParticipant] =
    useState<Participant | null>(null);
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { data: myProfile } = useMyGroupProfileQuery(params.groupId);
  const { data, isLoading, error } = useVoteResultQuery(params.groupId);
  const canViewPrivateProfiles = group?.myRole === "HOST";
  const { data: secondRoundParticipantGroup } = useParticipantListQuery(
    params.groupId,
    {
      detailRole: canViewPrivateProfiles ? "admin" : undefined,
      round: 2,
    },
  );
  const myParticipantId = resolveMyParticipantId(
    myProfile,
    group?.myParticipantId,
  );
  const mvpWinners = useMemo(() => {
    const trimmedKeyword = keyword.trim();
    return (data?.mvpWinners ?? []).filter(
      (winner) =>
        !trimmedKeyword || winner.displayName.includes(trimmedKeyword),
    );
  }, [data?.mvpWinners, keyword]);

  const secondRoundParticipants = useMemo(() => {
    const trimmedKeyword = keyword.trim();
    const participantById = new Map(
      secondRoundParticipantGroup.participants.map((participant) => [
        participant.id,
        participant,
      ]),
    );

    return (data?.secondRoundParticipants ?? [])
      .map((participant) =>
        toParticipant(
          participant,
          participantById.get(String(participant.participantId)),
        ),
      )
      .filter(
        (participant) =>
          !trimmedKeyword || participant.name.includes(trimmedKeyword),
      );
  }, [
    data?.secondRoundParticipants,
    keyword,
    secondRoundParticipantGroup.participants,
  ]);

  const isMvpList = mode === "mvp";
  const totalCount = isMvpList
    ? (data?.mvpWinners.length ?? 0)
    : (data?.secondRoundParticipants.length ?? 0);
  const title = isMvpList ? "오늘의 MVP 명단" : "2차 참가자 목록";
  const statsLabel = isMvpList ? "전체 MVP" : "전체 참가자";
  const backHref = withSessionContext(
    `${groupRoutes.voteResult(params.groupId)}?view=overall`,
    searchParams,
  );

  return (
    <MobileFrame
      className={participantStyles.screenFrame}
      viewportClassName={participantStyles.pageViewport}
    >
      <Header
        title={title}
        onBack={() => router.push(backHref)}
        backLabel="투표 결과로 이동"
        rightAction={<span className={styles.headerCount}>{totalCount}명</span>}
      />

      <div className={participantStyles.content}>
        <ParticipantSearch value={keyword} onChange={setKeyword} />
        <ParticipantStats count={totalCount} label={statsLabel} />

        <section className={participantStyles.listBox}>
          {data ? (
            isMvpList ? (
              <MvpWinnerList
                canViewPrivateProfiles={canViewPrivateProfiles}
                groupId={params.groupId}
                searchParams={searchParams}
                winners={mvpWinners}
              />
            ) : (
              <ParticipantList
                participants={secondRoundParticipants}
                round={2}
                currentParticipantId={myParticipantId}
                onPrivateSelect={setPrivateParticipant}
                canViewPrivateProfiles={canViewPrivateProfiles}
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
