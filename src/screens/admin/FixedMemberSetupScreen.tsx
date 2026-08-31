"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import FixedMemberCard from "@/features/assignment/components/FixedMemberCard";
import UnassignedMemberRow from "@/features/assignment/components/UnassignedMemberRow";
import { useCreateAssignmentMutation } from "@/features/assignment/hooks/useCreateAssignmentMutation";
import { useParticipantCandidatesQuery } from "@/features/assignment/hooks/useParticipantCandidatesQuery";
import {
  toBackendConditions,
  toFixedMembersRequest,
} from "@/features/assignment/model/assignment.mapper";
import {
  getAssignmentSetupDraft,
  saveAssignmentResultDraft,
} from "@/features/assignment/model/assignmentDraft.store";
import type { ParticipantCandidate } from "@/features/assignment/types/assignment.types";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import ParticipantSearch from "@/features/participant/components/ParticipantSearch";
import PrivateParticipantDialog from "@/features/participant/components/PrivateParticipantDialog";
import type { Participant } from "@/features/participant/types/participant.types";
import AssignmentWarningDialog from "@/modals/admin/AssignmentWarningDialog";
import SelectFixedGroupDialog from "@/modals/admin/SelectFixedGroupDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";
import styles from "@/features/assignment/components/fixed-members.module.css";

const DEFAULT_GROUP_COUNT = 3;

export default function FixedMemberSetupScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const round = toAssignmentRound(params.round);
  const { data: group } = useAdminGroupQuery(params.groupId);

  const setupDraft = getAssignmentSetupDraft(params.groupId, round);
  const groupCount = setupDraft?.groupCount ?? DEFAULT_GROUP_COUNT;

  const [keyword, setKeyword] = useState("");
  const [fixedTeamByParticipantId, setFixedTeamByParticipantId] = useState<
    Record<number, number>
  >({});
  const [assigningMember, setAssigningMember] =
    useState<ParticipantCandidate | null>(null);
  const [privateParticipant, setPrivateParticipant] =
    useState<Participant | null>(null);

  const {
    data: candidates,
    isLoading: isLoadingCandidates,
    error: candidatesError,
  } = useParticipantCandidatesQuery(params.groupId, round);

  const fixedMembers = useMemo(
    () =>
      candidates
        .filter(
          (candidate) => candidate.participantId in fixedTeamByParticipantId,
        )
        .sort(
          (a, b) =>
            fixedTeamByParticipantId[a.participantId] -
            fixedTeamByParticipantId[b.participantId],
        ),
    [candidates, fixedTeamByParticipantId],
  );

  const unassignedMembers = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    return candidates.filter((candidate) => {
      if (candidate.participantId in fixedTeamByParticipantId) return false;

      return (
        !trimmedKeyword || candidate.displayName.includes(trimmedKeyword)
      );
    });
  }, [candidates, fixedTeamByParticipantId, keyword]);

  // 참가자 수를 조 개수만큼 최대한 균등하게 나눴을 때의 기본 인원(base)과,
  // "+1명"을 받을 수 있는 조의 개수(remainder). 어느 조가 그 +1을 가져갈지는
  // 조 번호로 미리 정하지 않고, 고정 멤버를 먼저 채우는 조가 가져간다
  // (SelectFixedGroupDialog에서 실시간으로 판단).
  const base =
    groupCount > 0 ? Math.floor(candidates.length / groupCount) : 0;
  const remainder = groupCount > 0 ? candidates.length % groupCount : 0;

  const fixedCountByTeam = useMemo(() => {
    const counts: Record<number, number> = {};

    for (const [participantId, teamNumber] of Object.entries(
      fixedTeamByParticipantId,
    )) {
      // 이동 중인 멤버 본인은 현재 조 인원 수에서 제외해야
      // "그 조로 다시 선택"이 정원 초과로 막히지 않는다.
      if (
        assigningMember &&
        Number(participantId) === assigningMember.participantId
      ) {
        continue;
      }

      counts[teamNumber] = (counts[teamNumber] ?? 0) + 1;
    }

    return counts;
  }, [fixedTeamByParticipantId, assigningMember]);

  const removeFixedMember = (participantId: number) => {
    setFixedTeamByParticipantId((current) => {
      const next = { ...current };
      delete next[participantId];
      return next;
    });
  };

  const confirmAssignment = (teamNumber: number) => {
    if (!assigningMember) return;

    setFixedTeamByParticipantId((current) => ({
      ...current,
      [assigningMember.participantId]: teamNumber,
    }));
    setAssigningMember(null);
  };

  const goToProcessing = () => {
    router.push(
      withSessionContext(
        groupRoutes.adminAssignmentProcessing(params.groupId, round),
        searchParams,
      ),
    );
  };

  const [warningMessages, setWarningMessages] = useState<string[] | null>(
    null,
  );

  const {
    mutate: createAssignment,
    isPending: isAssigning,
    error: assignError,
  } = useCreateAssignmentMutation();

  const runAssignment = async () => {
    const result = await createAssignment(params.groupId, round, {
      teamCount: groupCount,
      conditions: toBackendConditions(setupDraft?.conditionKeys ?? []),
      fixedMembers: toFixedMembersRequest(fixedTeamByParticipantId),
    });

    if (!result) return;

    saveAssignmentResultDraft(params.groupId, round, result.teams);

    if (result.warnings.length > 0) {
      setWarningMessages(result.warnings);
      return;
    }

    goToProcessing();
  };

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="fixed-member-setup-screen"
      data-round={round}
    >
      <Header
        title={group.groupName}
        onBack={() =>
          router.push(
            withSessionContext(
              groupRoutes.adminAssignmentSetup(params.groupId, round),
              searchParams,
            ),
          )
        }
      />

      <TabNavigation
        items={[
          { id: "participants", label: "참가자" },
          { id: "assignment", label: "조 편성" },
        ]}
        activeItemId="assignment"
        ariaLabel="관리자 메뉴"
        onSelect={(item) => {
          if (item.id === "participants") {
            router.push(
              withSessionContext(
                groupRoutes.adminParticipants(params.groupId, round),
                searchParams,
              ),
            );
          }
        }}
      />

      <div className={styles.content}>
        <h2 className={styles.heading}>고정 멤버 설정</h2>

        <InfoBanner>이전 회차의 조와 조원 목록을 확인할 수 있습니다.</InfoBanner>

        <div className={styles.sectionHeadingRow}>
          <h3 className={styles.sectionHeading}>고정된 멤버</h3>
          <span className={styles.sectionCount}>
            {fixedMembers.length}명 고정됨
          </span>
        </div>

        {fixedMembers.length === 0 ? (
          <p className={styles.emptyFixedCard}>
            아직 고정한 멤버가 없어요. 아래 목록에서 참가자를 골라 조를
            지정해주세요.
          </p>
        ) : (
          <div className={styles.fixedCard}>
            {fixedMembers.map((member) => (
              <FixedMemberCard
                key={member.participantId}
                groupId={params.groupId}
                round={round}
                member={member}
                teamNumber={fixedTeamByParticipantId[member.participantId]}
                onRemove={removeFixedMember}
                onPrivateSelect={setPrivateParticipant}
              />
            ))}
          </div>
        )}

        <div className={styles.sectionHeadingRow}>
          <h3 className={styles.sectionHeading}>미지정 멤버</h3>
        </div>
        <p className={styles.sectionSubtitle}>
          행을 탭하면 조를 지정할 수 있어요
        </p>

        <ParticipantSearch value={keyword} onChange={setKeyword} />

        {candidatesError ? (
          <p className={styles.emptyState}>{candidatesError}</p>
        ) : isLoadingCandidates ? (
          <p className={styles.emptyState}>불러오는 중...</p>
        ) : unassignedMembers.length === 0 ? (
          <p className={styles.emptyState}>검색 결과가 없습니다</p>
        ) : (
          <ul className={styles.unassignedList}>
            {unassignedMembers.map((member) => (
              <UnassignedMemberRow
                key={member.participantId}
                groupId={params.groupId}
                round={round}
                member={member}
                onAssign={setAssigningMember}
                onPrivateSelect={setPrivateParticipant}
              />
            ))}
          </ul>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="secondary"
          type="button"
          disabled={fixedMembers.length > 0 || isAssigning}
          onClick={runAssignment}
        >
          고정 없이 편성
        </Button>
        <Button
          type="button"
          disabled={fixedMembers.length === 0 || isAssigning}
          onClick={runAssignment}
        >
          {isAssigning ? "편성 중..." : "편성 실행"}
        </Button>
        {assignError && (
          <span className={styles.errorText}>{assignError}</span>
        )}
      </div>

      <PrivateParticipantDialog
        participant={privateParticipant}
        onClose={() => setPrivateParticipant(null)}
      />

      <SelectFixedGroupDialog
        key={assigningMember?.participantId ?? "none"}
        open={assigningMember !== null}
        member={assigningMember}
        currentTeamNumber={
          assigningMember
            ? (fixedTeamByParticipantId[assigningMember.participantId] ?? null)
            : null
        }
        groupCount={groupCount}
        fixedCountByTeam={fixedCountByTeam}
        base={base}
        remainder={remainder}
        onClose={() => setAssigningMember(null)}
        onConfirm={confirmAssignment}
      />

      <AssignmentWarningDialog
        open={warningMessages !== null}
        warnings={warningMessages ?? []}
        onClose={() => setWarningMessages(null)}
        onReset={() =>
          router.push(
            withSessionContext(
              groupRoutes.adminAssignmentSetup(params.groupId, round),
              searchParams,
            ),
          )
        }
        onConfirm={goToProcessing}
      />
    </MobileFrame>
  );
}
