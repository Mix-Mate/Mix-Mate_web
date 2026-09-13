import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupExtraInfoScreen from "./GroupExtraInfoScreen";
import { getRecentProfileApi } from "@/features/profile/api/profile.api";
import { verifyInviteCodeApi } from "@/features/group/api/group.api";

const mockBack = vi.fn();
const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams("from=create");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace, push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/features/profile/api/profile.api", () => ({
  getRecentProfileApi: vi.fn(),
}));

vi.mock("@/features/group/api/group.api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/group/api/group.api")>();
  return {
    ...actual,
    verifyInviteCodeApi: vi
      .fn()
      .mockResolvedValue({
        status: "RECRUITING",
        groupId: 10,
        groupName: "테스트 모임",
      }),
    createGroupApi: vi.fn(),
    joinGroupWithProfileApi: vi.fn(),
  };
});

const mockRecentProfile = {
  displayName: "홍길동",
  studentId: "20210001",
  position: "STAFF",
  major: "컴퓨터공학과",
  isNew: true,
  grade: "THIRD",
  gender: "MALE",
  mbti: "ENFP",
  age: 24,
  instaId: "hong_insta",
  bio: "안녕하세요 반갑습니다.",
  visibility: "PRIVATE",
};

describe("GroupExtraInfoScreen 프로필 prefill 연동", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("from=create");
    vi.mocked(verifyInviteCodeApi).mockResolvedValue({
      status: "RECRUITING",
      groupId: 10,
      groupName: "테스트 모임",
    });
  });


  it("마운트 시 최근 프로필(200 OK)이 반환되면 폼 필드들을 자동으로 채운다 (그룹 생성)", async () => {
    vi.mocked(getRecentProfileApi).mockResolvedValue(mockRecentProfile);

    render(<GroupExtraInfoScreen groupId="new" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("이름 입력")).toHaveValue("홍길동");
    });

    expect(screen.getByPlaceholderText("소속 입력")).toHaveValue("컴퓨터공학과");
    expect(screen.getByPlaceholderText("학번 입력")).toHaveValue("20210001");
    expect(screen.getByPlaceholderText("나이 입력")).toHaveValue("24");
    expect(screen.getByPlaceholderText("@아이디 입력")).toHaveValue(
      "@hong_insta",
    );
    expect(
      screen.getByPlaceholderText("자기소개를 입력해 주세요"),
    ).toHaveValue("안녕하세요 반갑습니다.");

    // 학년 (THIRD -> 3학년)
    expect(screen.getByRole("button", { name: "3학년" })).toHaveClass(
      /activeChip/,
    );
    // 성별 (MALE -> 남)
    expect(screen.getByRole("button", { name: "남" })).toHaveClass(
      /activeChip/,
    );
    // 신입 여부 (true -> 신입)
    expect(screen.getByRole("button", { name: "신입" })).toHaveClass(
      /activeChip/,
    );
    // MBTI (ENFP)
    expect(screen.getByRole("button", { name: /ENFP/ })).toBeInTheDocument();
    // 공개 여부 (PRIVATE -> 비공개)
    expect(screen.getByRole("button", { name: "비공개" })).toHaveClass(
      /activeChip/,
    );
    // 그룹 생성 시 직급은 운영진 기본 유지
    expect(screen.getByRole("button", { name: "운영진" })).toHaveClass(
      /activeChip/,
    );
  });

  it("그룹 입장 플로우에서 최근 프로필의 일반 직급(MEMBER)이 정상 반영된다", async () => {
    mockSearchParams = new URLSearchParams("from=join&inviteCode=ABCDEF");
    vi.mocked(getRecentProfileApi).mockResolvedValue({
      ...mockRecentProfile,
      position: "MEMBER",
      grade: "FIRST",
      gender: "FEMALE",
      isNew: false,
      visibility: "PUBLIC",
    });

    render(<GroupExtraInfoScreen groupId="10" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("이름 입력")).toHaveValue("홍길동");
    });

    expect(screen.getByRole("button", { name: "일반" })).toHaveClass(
      /activeChip/,
    );
    expect(screen.getByRole("button", { name: "1학년" })).toHaveClass(
      /activeChip/,
    );
    expect(screen.getByRole("button", { name: "여" })).toHaveClass(
      /activeChip/,
    );
    expect(screen.getByRole("button", { name: "기존" })).toHaveClass(
      /activeChip/,
    );
    expect(screen.getByRole("button", { name: "전체 공개" })).toHaveClass(
      /activeChip/,
    );
  });

  it("204 No Content(null) 응답 시 조용히 빈 기본 폼 상태를 유지한다", async () => {
    vi.mocked(getRecentProfileApi).mockResolvedValue(null);

    render(<GroupExtraInfoScreen groupId="new" />);

    await waitFor(() => {
      expect(getRecentProfileApi).toHaveBeenCalled();
    });

    expect(screen.getByPlaceholderText("이름 입력")).toHaveValue("");
    expect(screen.getByPlaceholderText("학번 입력")).toHaveValue("");
    expect(screen.getByPlaceholderText("소속 입력")).toHaveValue("");
    expect(screen.getByPlaceholderText("나이 입력")).toHaveValue("");
    expect(screen.getByPlaceholderText("@아이디 입력")).toHaveValue("");
    expect(
      screen.getByPlaceholderText("자기소개를 입력해 주세요"),
    ).toHaveValue("");
    // 에러 모달이 뜨지 않아야 함
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("401 또는 네트워크 에러 발생 시 조용히 빈 폼을 유지하고 사용자 흐름을 방해하지 않는다", async () => {
    vi.mocked(getRecentProfileApi).mockRejectedValue(
      new Error("Network Error"),
    );

    render(<GroupExtraInfoScreen groupId="new" />);

    await waitFor(() => {
      expect(getRecentProfileApi).toHaveBeenCalled();
    });

    expect(screen.getByPlaceholderText("이름 입력")).toHaveValue("");
    expect(screen.getByPlaceholderText("소속 입력")).toHaveValue("");
    // 에러 모달이 뜨지 않아야 함
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("사용자가 이미 입력 중인 값이 있는 경우 prefill로 덮어쓰지 않는다", async () => {
    let resolveRecentProfile: (val: typeof mockRecentProfile) => void;
    const pendingPromise = new Promise<typeof mockRecentProfile>((resolve) => {
      resolveRecentProfile = resolve;
    });
    vi.mocked(getRecentProfileApi).mockReturnValue(pendingPromise);

    render(<GroupExtraInfoScreen groupId="new" />);

    // 사용자가 API 응답 이전에 이름을 직접 입력
    const nameInput = screen.getByPlaceholderText("이름 입력");
    fireEvent.change(nameInput, { target: { value: "내이름" } });

    // 사용자가 소속도 직접 입력
    const majorInput = screen.getByPlaceholderText("소속 입력");
    fireEvent.change(majorInput, { target: { value: "전자공학과" } });

    // API 응답 완료
    resolveRecentProfile!(mockRecentProfile);

    await waitFor(() => {
      // API 응답의 "홍길동", "컴퓨터공학과"로 덮어써지지 않고 사용자가 입력한 값 유지
      expect(screen.getByPlaceholderText("이름 입력")).toHaveValue("내이름");
      expect(screen.getByPlaceholderText("소속 입력")).toHaveValue(
        "전자공학과",
      );
    });

    // 사용자가 입력하지 않은 다른 필드는 prefill 됨
    expect(screen.getByPlaceholderText("나이 입력")).toHaveValue("24");
    expect(screen.getByRole("button", { name: "3학년" })).toHaveClass(
      /activeChip/,
    );
  });
});
