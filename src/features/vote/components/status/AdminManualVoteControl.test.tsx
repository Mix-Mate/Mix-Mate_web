import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminManualVoteControl from "./AdminManualVoteControl";
import type { SecondRoundVoteParticipant } from "../../types/secondRoundVoteStatus.types";

const voteSecondRoundByHost = vi.fn();
const correctSecondRoundVoteByHost = vi.fn();

vi.mock("../../api/adminSecondRoundVote.api", () => ({
  voteSecondRoundByHost: (...args: unknown[]) =>
    voteSecondRoundByHost(...args),
  correctSecondRoundVoteByHost: (...args: unknown[]) =>
    correctSecondRoundVoteByHost(...args),
}));

function createMember(
  overrides: Partial<SecondRoundVoteParticipant> = {},
): SecondRoundVoteParticipant {
  return {
    participantId: 7,
    displayName: "유건우",
    choice: null,
    manualEntry: true,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminManualVoteControl", () => {
  it("트리거를 누르면 참가/불참 메뉴가 열린다", () => {
    render(
      <AdminManualVoteControl
        groupId="1"
        member={createMember()}
        onVoteChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "유건우 수동 투표" }));

    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getByRole("menuitemradio", { name: /참가/ })).toBeTruthy();
    expect(screen.getByRole("menuitemradio", { name: /불참/ })).toBeTruthy();
  });

  it("아직 투표하지 않은 참가자를 고르면 대신 투표(POST)를 호출한다", async () => {
    const onVoteChange = vi.fn();
    voteSecondRoundByHost.mockResolvedValue(undefined);

    render(
      <AdminManualVoteControl
        groupId="1"
        member={createMember()}
        onVoteChange={onVoteChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "유건우 수동 투표" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /참가/ }));

    await waitFor(() => {
      expect(voteSecondRoundByHost).toHaveBeenCalledWith("1", 7, "PARTICIPATE");
    });
    expect(correctSecondRoundVoteByHost).not.toHaveBeenCalled();
    await waitFor(() => expect(onVoteChange).toHaveBeenCalled());
  });

  it("이미 지정된 참가자를 다시 고르면 정정(PATCH)을 호출한다", async () => {
    correctSecondRoundVoteByHost.mockResolvedValue(undefined);

    render(
      <AdminManualVoteControl
        groupId="1"
        member={createMember({ choice: "PARTICIPATE" })}
        onVoteChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "유건우 수동 투표" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /불참/ }));

    await waitFor(() => {
      expect(correctSecondRoundVoteByHost).toHaveBeenCalledWith(
        "1",
        7,
        "NOT_PARTICIPATE",
      );
    });
    expect(voteSecondRoundByHost).not.toHaveBeenCalled();
  });

  it("실패하면 에러를 화면 단위로 올려준다", async () => {
    const onError = vi.fn();
    voteSecondRoundByHost.mockRejectedValue(new Error("계정이 있는 참가자입니다."));

    render(
      <AdminManualVoteControl
        groupId="1"
        member={createMember()}
        onVoteChange={vi.fn()}
        onError={onError}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "유건우 수동 투표" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /참가/ }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("계정이 있는 참가자입니다.");
    });
  });
});
