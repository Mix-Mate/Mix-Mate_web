import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Participant } from "../types/participant.types";
import RecruitmentParticipantCard from "./RecruitmentParticipantCard";

function participant(
  id: string,
  name: string,
  overrides: Partial<Participant> = {},
): Participant {
  return {
    id,
    name,
    department: "소프트웨어학과",
    visibility: "public",
    role: "general",
    gender: "male",
    ...overrides,
  };
}

describe("RecruitmentParticipantCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("초기 서버 순서를 유지하고 참가자가 없으면 Figma empty state를 보여준다", () => {
    const { unmount } = render(
      <RecruitmentParticipantCard
        count={0}
        isLoading={false}
        participants={[]}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("그룹을 모집하고 있습니다.")).toBeInTheDocument();
    unmount();

    render(
      <RecruitmentParticipantCard
        count={2}
        isLoading={false}
        participants={[participant("2", "B"), participant("1", "A")]}
        onNavigate={vi.fn()}
      />,
    );

    expect(
      screen.getByText("B").compareDocumentPosition(screen.getByText("A")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("모집 인원이 1명이면 참가자 응답에 HOST가 있어도 empty state를 보여준다", () => {
    render(
      <RecruitmentParticipantCard
        count={1}
        isLoading={false}
        participants={[participant("1", "HOST", { role: "staff" })]}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("그룹을 모집하고 있습니다.")).toBeInTheDocument();
    expect(screen.queryByText("HOST")).not.toBeInTheDocument();
  });

  it("새 참가자만 Skeleton에서 실제 카드로 전환하고 최상단 방금 참여를 유지한다", async () => {
    const initial = [participant("2", "B"), participant("1", "A")];
    const joined = participant("3", "C", {
      role: "staff",
      visibility: "private",
    });
    const { rerender } = render(
      <RecruitmentParticipantCard
        count={2}
        isLoading={false}
        participants={initial}
        onNavigate={vi.fn()}
      />,
    );

    rerender(
      <RecruitmentParticipantCard
        count={3}
        isLoading={false}
        participants={[joined, ...initial]}
        onNavigate={vi.fn()}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByTestId("incoming-participant")).toHaveAttribute(
      "data-phase",
      "skeleton",
    );
    expect(
      screen.getByLabelText("새 참가자 정보를 불러오는 중"),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(520);
    });
    expect(screen.getByTestId("incoming-participant")).toHaveAttribute(
      "data-phase",
      "participant",
    );
    expect(screen.getByText("방금 참여")).toBeInTheDocument();
    expect(screen.getByText("운영진")).toBeInTheDocument();
    expect(screen.getByLabelText("비공개 프로필")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(screen.queryByTestId("incoming-participant")).not.toBeInTheDocument();
    expect(screen.getByText("방금 참여")).toBeInTheDocument();

    rerender(
      <RecruitmentParticipantCard
        count={3}
        isLoading={false}
        participants={[joined, ...initial]}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("incoming-participant")).not.toBeInTheDocument();
    expect(screen.getAllByText("C")).toHaveLength(1);
  });

  it("짧은 시간에 여러 명이 들어오면 한 명씩 처리해 최종 최신순을 만든다", async () => {
    const a = participant("1", "A");
    const b = participant("2", "B");
    const c = participant("3", "C");
    const d = participant("4", "D");
    const { rerender } = render(
      <RecruitmentParticipantCard
        count={2}
        isLoading={false}
        participants={[b, a]}
        onNavigate={vi.fn()}
      />,
    );

    rerender(
      <RecruitmentParticipantCard
        count={4}
        isLoading={false}
        participants={[d, c, b, a]}
        onNavigate={vi.fn()}
      />,
    );
    for (let index = 0; index < 2; index += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(720);
      });
    }

    expect(screen.getAllByText("D")).toHaveLength(1);
    expect(screen.getAllByText("C")).toHaveLength(1);
    expect(screen.getByText("방금 참여").parentElement?.parentElement).toHaveTextContent(
      "D",
    );
  });

  it("tap과 키보드는 이동하고 스크롤 제스처 뒤 click은 이동하지 않는다", () => {
    const onNavigate = vi.fn();
    render(
      <RecruitmentParticipantCard
        count={1}
        isLoading={false}
        participants={[participant("1", "A")]}
        onNavigate={onNavigate}
      />,
    );
    const card = screen.getByRole("link");

    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });
    fireEvent.keyDown(card, { key: " " });
    expect(onNavigate).toHaveBeenCalledTimes(3);

    fireEvent.pointerDown(card, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(card, { clientX: 10, clientY: 30 });
    fireEvent.click(card);
    expect(onNavigate).toHaveBeenCalledTimes(3);
  });
});
