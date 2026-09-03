import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { VoteResultResponse } from "../../types/voteResult.types";
import VoteResultContent from "./VoteResultContent";

function createResult(participantCount: number): VoteResultResponse {
  return {
    mvpWinners: [],
    secondRoundParticipants: Array.from(
      { length: participantCount },
      (_, index) => ({
        participantId: index + 1,
        displayName: `참가자 ${index + 1}`,
        major: "전공",
        gender: "MALE",
        visibility: "PUBLIC",
      }),
    ),
  };
}

function renderResult(
  participantCount: number,
  onOpenSecondRoundParticipantList = vi.fn(),
) {
  render(
    <VoteResultContent
      result={createResult(participantCount)}
      introMvpWinner={null}
      showOverallResult
      onRevealOverallResult={vi.fn()}
      onHome={vi.fn()}
      onOpenMvpList={vi.fn()}
      onOpenSecondRoundParticipantList={onOpenSecondRoundParticipantList}
    />,
  );
}

describe("VoteResultContent", () => {
  it("2차 참여자가 8명 미만이면 참가자 목록 버튼을 숨긴다", () => {
    renderResult(7);

    expect(
      screen.queryByRole("button", { name: "2차 참가자 목록" }),
    ).not.toBeInTheDocument();
  });

  it("2차 참여자가 8명이면 참가자 목록 버튼을 보여준다", () => {
    const onOpenSecondRoundParticipantList = vi.fn();
    renderResult(8, onOpenSecondRoundParticipantList);

    fireEvent.click(
      screen.getByRole("button", { name: "2차 참가자 목록" }),
    );

    expect(onOpenSecondRoundParticipantList).toHaveBeenCalledOnce();
  });
});
