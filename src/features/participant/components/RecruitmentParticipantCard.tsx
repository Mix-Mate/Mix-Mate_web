"use client";

import { Clock3, Lock } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import type { Participant } from "../types/participant.types";
import styles from "./RecruitmentParticipantCard.module.css";

interface RecruitmentParticipantCardProps {
  count: number;
  isLoading: boolean;
  onNavigate: () => void;
  participants: Participant[];
}

type IncomingPhase = "space" | "skeleton" | "participant";

const MAX_VISIBLE_PARTICIPANTS = 3;

function ParticipantRow({
  participant,
  isNewest = false,
  isExiting = false,
}: {
  participant: Participant;
  isNewest?: boolean;
  isExiting?: boolean;
}) {
  return (
    <div
      className={`${styles.participantRow} ${isNewest ? styles.newestRow : ""} ${
        isExiting ? styles.exitingRow : ""
      }`}
    >
      <GenderAvatar
        className={isNewest ? styles.newestAvatar : styles.avatar}
        gender={participant.gender}
        name={participant.name}
        toneKey={participant.id}
        size={41}
        backgroundColor={isNewest ? "#1642c8" : undefined}
      />

      <div className={styles.participantInfo}>
        <div className={styles.nameRow}>
          <strong>{participant.name}</strong>
          {participant.role === "staff" && (
            <span className={styles.staffBadge}>운영진</span>
          )}
        </div>
        <span>{participant.department}</span>
      </div>

      {(isNewest || participant.visibility === "private") && (
        <span className={styles.endBadges}>
          {isNewest && (
            <span className={styles.justJoinedBadge}>방금 참여</span>
          )}
          {participant.visibility === "private" && (
            <span className={styles.privateBadge} aria-label="비공개 프로필">
              <Lock aria-hidden="true" size={14} strokeWidth={2} />
            </span>
          )}
        </span>
      )}
    </div>
  );
}

function ParticipantSkeleton() {
  return (
    <div
      className={styles.skeletonRow}
      aria-label="새 참가자 정보를 불러오는 중"
    >
      <span className={styles.skeletonAvatar} />
      <span className={styles.skeletonText}>
        <span className={styles.skeletonName} />
        <span className={styles.skeletonDepartment} />
      </span>
    </div>
  );
}

const RecruitmentParticipantCard = forwardRef<
  HTMLDivElement,
  RecruitmentParticipantCardProps
>(function RecruitmentParticipantCard(
  { count, isLoading, onNavigate, participants },
  ref,
) {
  const initializedRef = useRef(false);
  const seenIdsRef = useRef(new Set<string>());
  const pendingIdsRef = useRef(new Set<string>());
  const latestParticipantsRef = useRef(participants);
  // 참가자를 화면에 표시하는 순서(항상 최근 참여 순). 서버 응답의 배열 순서와
  // 무관하게, 한 번 정해진 순서는 새 참가자가 맨 앞에 들어올 때만 바뀐다.
  const displayOrderRef = useRef<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMovedRef = useRef(false);
  const [renderedParticipants, setRenderedParticipants] = useState<
    Participant[]
  >([]);
  const [incomingQueue, setIncomingQueue] = useState<Participant[]>([]);
  const [incomingParticipant, setIncomingParticipant] =
    useState<Participant | null>(null);
  const [incomingPhase, setIncomingPhase] = useState<IncomingPhase>("space");
  const [newestParticipantId, setNewestParticipantId] = useState<string | null>(
    null,
  );
  const [exitingParticipant, setExitingParticipant] =
    useState<Participant | null>(null);

  useEffect(() => {
    latestParticipantsRef.current = participants;

    if (isLoading) return;

    const participantsById = new Map(
      participants.map((participant) => [participant.id, participant]),
    );

    if (!initializedRef.current) {
      initializedRef.current = true;
      seenIdsRef.current = new Set(participantsById.keys());
      displayOrderRef.current = participants.map(
        (participant) => participant.id,
      );
      setRenderedParticipants(participants);
      return;
    }

    const addedParticipants = participants.filter(
      (participant) => !seenIdsRef.current.has(participant.id),
    );

    addedParticipants.forEach((participant) => {
      seenIdsRef.current.add(participant.id);
      pendingIdsRef.current.add(participant.id);
    });

    // 순서는 새 참가자가 맨 앞에 합류할 때만 바뀐다. 더 이상 응답에 없는
    // 참가자는 순서에서 빼고, 아직 공개 전인(pending) 참가자는 잠시 숨긴다.
    displayOrderRef.current = displayOrderRef.current.filter(
      (id) => participantsById.has(id) && !pendingIdsRef.current.has(id),
    );

    setRenderedParticipants(
      displayOrderRef.current
        .map((id) => participantsById.get(id))
        .filter((participant): participant is Participant =>
          Boolean(participant),
        ),
    );

    if (addedParticipants.length > 0) {
      if (listRef.current) listRef.current.scrollTop = 0;
      // 서버의 최신순 응답을 역순으로 큐에 넣어 연속 참여도 시간순으로 재생한다.
      setIncomingQueue((current) => [
        ...current,
        ...addedParticipants.slice().reverse(),
      ]);
    }
  }, [isLoading, participants]);

  useEffect(() => {
    if (count <= 1 || incomingParticipant || incomingQueue.length === 0) return;

    const startTimer = window.setTimeout(() => {
      setNewestParticipantId(null);
      setIncomingParticipant(incomingQueue[0]);
      setIncomingQueue((current) => current.slice(1));
      setIncomingPhase("space");
    }, 0);

    return () => window.clearTimeout(startTimer);
  }, [count, incomingParticipant, incomingQueue]);

  useEffect(() => {
    if (count <= 1 || !incomingParticipant) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const profileDelay = reducedMotion ? 60 : 520;
    const commitDelay = reducedMotion ? 100 : 720;
    const frameId = window.requestAnimationFrame(() => {
      setIncomingPhase("skeleton");
    });
    const profileTimer = window.setTimeout(() => {
      setIncomingPhase("participant");
    }, profileDelay);
    const commitTimer = window.setTimeout(() => {
      const participant =
        latestParticipantsRef.current.find(
          (candidate) => candidate.id === incomingParticipant.id,
        ) ?? incomingParticipant;

      pendingIdsRef.current.delete(participant.id);

      // 새 참가자를 맨 앞으로 – 기존 참가자들의 상대 순서는 그대로 유지된다.
      displayOrderRef.current = [
        participant.id,
        ...displayOrderRef.current.filter((id) => id !== participant.id),
      ];

      const participantsById = new Map(
        latestParticipantsRef.current.map((candidate) => [
          candidate.id,
          candidate,
        ]),
      );
      participantsById.set(participant.id, participant);

      const next = displayOrderRef.current
        .map((id) => participantsById.get(id))
        .filter((candidate): candidate is Participant => Boolean(candidate));

      // 상위 N명만 보여주므로, 새로 들어온 자리만큼 밀려나는 참가자는
      // 즉시 사라지지 않고 아래로 내려가며 사라지는 애니메이션을 거친다.
      const overflowParticipant = next[MAX_VISIBLE_PARTICIPANTS] ?? null;

      setRenderedParticipants(next);
      setNewestParticipantId(participant.id);
      setIncomingParticipant(null);
      setIncomingPhase("space");
      if (overflowParticipant) {
        setExitingParticipant(overflowParticipant);
      }
    }, commitDelay);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(profileTimer);
      window.clearTimeout(commitTimer);
    };
  }, [count, incomingParticipant]);

  useEffect(() => {
    if (!exitingParticipant) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const exitTimer = window.setTimeout(
      () => {
        setExitingParticipant(null);
      },
      reducedMotion ? 60 : 260,
    );

    return () => window.clearTimeout(exitTimer);
  }, [exitingParticipant]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onNavigate();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    pointerMovedRef.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start) return;

    if (
      Math.abs(event.clientX - start.x) > 8 ||
      Math.abs(event.clientY - start.y) > 8
    ) {
      pointerMovedRef.current = true;
    }
  };

  const isEmpty =
    count <= 1 || (renderedParticipants.length === 0 && !incomingParticipant);

  return (
    <div
      ref={ref}
      className={styles.card}
      role="link"
      tabIndex={0}
      aria-label={`현재 모집된 인원 ${count}명, 참가자 목록 보기`}
      onClick={(event) => {
        if (pointerMovedRef.current) {
          event.preventDefault();
          pointerMovedRef.current = false;
          pointerStartRef.current = null;
          return;
        }
        onNavigate();
      }}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerCancel={() => {
        pointerStartRef.current = null;
        pointerMovedRef.current = false;
      }}
    >
      <div className={styles.summaryTop}>
        <span className={styles.participantCountInfo}>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} aria-hidden="true" />
            실시간 집계
          </span>
          <span className={styles.participantCountLabel}>현재 모집된 인원</span>
        </span>
        <span className={styles.participantCountValue} aria-hidden="true">
          <strong>{count}</strong>
          <span>명</span>
        </span>
      </div>

      <span className={styles.divider} aria-hidden="true" />

      <div className={styles.recentHeader}>
        <span>최근 참여자</span>
        <span className={styles.latestBadge}>
          <span className={styles.latestDot} aria-hidden="true" />
          최신 참여순
        </span>
      </div>

      {isEmpty ? (
        <div className={styles.emptyState}>
          <span className={styles.clockIcon} aria-hidden="true">
            <Clock3 size={24} strokeWidth={1.8} />
          </span>
          <strong>그룹을 모집하고 있습니다.</strong>
          <p className={styles.minimumParticipantText}>
            참가자가 <strong>4명</strong> 이상 모이면 1차 술자리를 시작할 수
            있어요.
          </p>
        </div>
      ) : (
        <div
          ref={listRef}
          className={styles.participantList}
          onScroll={() => {
            pointerMovedRef.current = true;
          }}
        >
          {incomingParticipant && (
            <div
              data-testid="incoming-participant"
              data-phase={incomingPhase}
              className={`${styles.incomingItem} ${styles[`incoming-${incomingPhase}`]}`}
            >
              <div
                className={styles.incomingSkeleton}
                aria-hidden={incomingPhase === "participant"}
              >
                <ParticipantSkeleton />
              </div>
              <div
                className={styles.incomingProfile}
                aria-hidden={incomingPhase !== "participant"}
                aria-live="polite"
              >
                <ParticipantRow participant={incomingParticipant} isNewest />
              </div>
            </div>
          )}

          {renderedParticipants
            .slice(0, MAX_VISIBLE_PARTICIPANTS)
            .map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                isNewest={participant.id === newestParticipantId}
              />
            ))}

          {exitingParticipant && (
            <ParticipantRow
              key={exitingParticipant.id}
              participant={exitingParticipant}
              isExiting
            />
          )}
        </div>
      )}
    </div>
  );
});

export default RecruitmentParticipantCard;
