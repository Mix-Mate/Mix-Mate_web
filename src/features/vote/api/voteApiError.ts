interface VoteApiErrorResponse {
  code?: unknown;
  message?: unknown;
}

export class VoteApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
    message: string,
  ) {
    super(message);
    this.name = "VoteApiError";
  }
}

export async function createVoteApiError(
  response: Response,
  fallbackMessage: string,
): Promise<VoteApiError> {
  try {
    const body = (await response.json()) as VoteApiErrorResponse;

    return new VoteApiError(
      response.status,
      typeof body.code === "string" ? body.code : null,
      typeof body.message === "string" ? body.message : fallbackMessage,
    );
  } catch {
    return new VoteApiError(response.status, null, fallbackMessage);
  }
}

export function isAlreadyVotedError(error: unknown): boolean {
  if (!error) return false;

  if (error instanceof VoteApiError) {
    if (
      error.status === 409 ||
      error.status === 400 ||
      error.status === 403 ||
      error.status === 422
    ) {
      return true;
    }
    if (
      error.code === "ALREADY_VOTED" ||
      error.code === "VOTE_ALREADY_SUBMITTED" ||
      error.code === "VOTE_CLOSED" ||
      error.code === "ALREADY_COMPLETED"
    ) {
      return true;
    }
  }

  if (typeof error === "object" && error !== null) {
    const err = error as { status?: unknown; message?: unknown; code?: unknown };
    if (
      err.status === 409 ||
      err.status === 400 ||
      err.status === 403 ||
      err.status === 422
    ) {
      return true;
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return (
    normalized.includes("이미") ||
    normalized.includes("완료") ||
    normalized.includes("종료") ||
    normalized.includes("already") ||
    normalized.includes("voted") ||
    normalized.includes("closed") ||
    normalized.includes("duplicate")
  );
}
