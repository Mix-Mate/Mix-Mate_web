import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ParticipantCard from "./ParticipantCard";

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6" }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("ParticipantCard", () => {
  it("shows private profile grade and role in the participant list", () => {
    render(
      <ul>
        <ParticipantCard
          participant={{
            id: "1",
            name: "151515",
            department: "15151",
            visibility: "private",
            role: "general",
            gender: "male",
            grade: "3학년",
          }}
        />
      </ul>,
    );

    expect(screen.getByText("3학년 · 일반")).toBeInTheDocument();
    expect(screen.queryByText("15151")).not.toBeInTheDocument();
    expect(screen.getByLabelText("비공개 프로필")).toBeInTheDocument();
  });

  it("shows private profile details for admin views", () => {
    render(
      <ul>
        <ParticipantCard
          canViewPrivateProfiles
          participant={{
            id: "1",
            name: "151515",
            department: "15151",
            visibility: "private",
            role: "general",
            gender: "male",
            grade: "3학년",
          }}
        />
      </ul>,
    );

    expect(screen.getByText("3학년 · 일반")).toBeInTheDocument();
    expect(screen.queryByLabelText("비공개 프로필")).not.toBeInTheDocument();
  });
});
