"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getParticipantPool } from "@/features/assignment/api/assignment.api";
import FixedMemberCard from "@/features/assignment/components/FixedMemberCard";
import UnassignedMemberRow from "@/features/assignment/components/UnassignedMemberRow";
import {
  getAssignmentSetupDraft,
  saveAssignmentResultDraft,
} from "@/features/assignment/model/assignmentDraft.store";
import {
  assignTeams,
  evaluateAssignmentWarnings,
} from "@/features/assignment/model/assignment.rules";
import type { FixedMemberCandidate } from "@/features/assignment/types/assignment.types";
import ParticipantFilter from "@/features/participant/components/ParticipantFilter";
import type { ParticipantFilterValue } from "@/features/participant/components/ParticipantFilter";
import ParticipantSearch from "@/features/participant/components/ParticipantSearch";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
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
  const round = toAssignmentRound(params.round);
  const { data: group } = useAdminGroupQuery(params.groupId);

  const setupDraft = getAssignmentSetupDraft(params.groupId, round);
  const groupCount = setupDraft?.groupCount ?? DEFAULT_GROUP_COUNT;

  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<ParticipantFilterValue>("all");
  const [fixedTeamByMemberId, setFixedTeamByMemberId] = useState<
    Record<string, number>
  >({});
  const [assigningMember, setAssigningMember] =
    useState<FixedMemberCandidate | null>(null);

  const candidates = useMemo(() => getParticipantPool(), []);

  const fixedMembers = useMemo(
    () =>
      candidates
        .filter((candidate) => candidate.id in fixedTeamByMemberId)
        .map((candidate) => ({
          ...candidate,
          fixedTeamNumber: fixedTeamByMemberId[candidate.id],
        })),
    [candidates, fixedTeamByMemberId],
  );

  const unassignedMembers = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    return candidates.filter((candidate) => {
      if (candidate.id in fixedTeamByMemberId) return false;

      const matchesKeyword =
        !trimmedKeyword || candidate.name.includes(trimmedKeyword);
      const matchesFilter = filter === "all" || candidate.role === filter;

      return matchesKeyword && matchesFilter;
    });
  }, [candidates, fixedTeamByMemberId, filter, keyword]);

  const removeFixedMember = (memberId: string) => {
    setFixedTeamByMemberId((current) => {
      const next = { ...current };
      delete next[memberId];
      return next;
    });
  };

  const confirmAssignment = (teamNumber: number) => {
    if (!assigningMember) return;

    setFixedTeamByMemberId((current) => ({
      ...current,
      [assigningMember.id]: teamNumber,
    }));
    setAssigningMember(null);
  };

  const goToProcessing = () => {
    router.push(groupRoutes.adminAssignmentProcessing(params.groupId, round));
  };

  const [warningMessages, setWarningMessages] = useState<string[] | null>(
    null,
  );

  const runAssignment = () => {
    const candidatesForAssignment = candidates.map((candidate) =>
      candidate.id in fixedTeamByMemberId
        ? { ...candidate, fixedTeamNumber: fixedTeamByMemberId[candidate.id] }
        : candidate,
    );

    const teams = assignTeams(candidatesForAssignment, groupCount);
    const warnings = evaluateAssignmentWarnings(
      teams,
      setupDraft?.conditionKeys ?? [],
    );

    saveAssignmentResultDraft(params.groupId, round, teams);

    if (warnings.length > 0) {
      setWarningMessages(warnings.map((warning) => warning.message));
      return;
    }

    goToProcessing();
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="fixed-member-setup-screen"
      data-round={round}
    >
      <Header title={group.name} onBack={() => router.back()} />

      <TabNavigation
        items={[
          { id: "participants", label: "참가자" },
          { id: "assignment", label: "조 편성" },
        ]}
        activeItemId="assignment"
        ariaLabel="관리자 메뉴"
        onSelect={(item) => {
          if (item.id === "participants") {
            router.push(groupRoutes.participants(params.groupId));
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
                key={member.id}
                member={member}
                onRemove={removeFixedMember}
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
        <div className={styles.filterWrapper}>
          <ParticipantFilter value={filter} onChange={setFilter} />
        </div>

        {unassignedMembers.length === 0 ? (
          <p className={styles.emptyState}>검색 결과가 없습니다</p>
        ) : (
          <ul className={styles.unassignedList}>
            {unassignedMembers.map((member) => (
              <UnassignedMemberRow
                key={member.id}
                member={member}
                onAssign={setAssigningMember}
              />
            ))}
          </ul>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="secondary"
          type="button"
          disabled={fixedMembers.length > 0}
          onClick={runAssignment}
        >
          고정 없이 편성
        </Button>
        <Button
          type="button"
          disabled={fixedMembers.length === 0}
          onClick={runAssignment}
        >
          편성 실행
        </Button>
      </div>

      <SelectFixedGroupDialog
        key={assigningMember?.id ?? "none"}
        open={assigningMember !== null}
        member={assigningMember}
        groupCount={groupCount}
        onClose={() => setAssigningMember(null)}
        onConfirm={confirmAssignment}
      />

      <AssignmentWarningDialog
        open={warningMessages !== null}
        warnings={warningMessages ?? []}
        onClose={() => setWarningMessages(null)}
        onReset={() =>
          router.push(groupRoutes.adminAssignmentSetup(params.groupId, round))
        }
        onConfirm={goToProcessing}
      />
    </MobileFrame>
  );
}
