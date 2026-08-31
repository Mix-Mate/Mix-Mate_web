import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import { createGroupHomeSnapshot } from "../model/group-session";
import UserSessionContent from "./UserSessionContent";

const group: GroupDetail = {
  groupId: 12,
  groupName: "API 그룹",
  description: null,
  status: "BEFORE_FIRST_ROUND",
  inviteCode: "ABC123",
  createdAt: "2026-08-27T00:00:00.000Z",
  memberCount: 8,
  myRole: "HOST",
  myParticipantId: 3,
};

describe("UserSessionContent", () => {
  it("관리자는 종료 권한이 없는 status에서도 진행 현황 버튼을 볼 수 있다", () => {
    const onNavigate = vi.fn();

    render(
      <UserSessionContent
        groupId="12"
        snapshot={createGroupHomeSnapshot(group)}
        statusLabel="1차 준비 중"
        teamNumber={null}
        isTeamLoading={false}
        teamError={null}
        onNavigate={onNavigate}
        onRequestLeave={vi.fn()}
        onRequestEndRound={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "1차 준비 중, 진행 현황 보기",
      }),
    );

    expect(onNavigate).toHaveBeenCalledWith("/groups/12/admin/progress");
  });
});
