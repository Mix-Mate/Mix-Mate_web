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
  if (typeof error === "object" && error !== null) {
    const { code } = error as { code?: unknown };
    if (typeof code === "string" && code.length > 0) {
      return (
        code === "ALREADY_VOTED" ||
        code === "VOTE_ALREADY_SUBMITTED" ||
        code === "ALREADY_COMPLETED"
      );
    }
  }
  const message = error instanceof Error ? error.message : String(error);
  return /이미.*투표|투표.*이미|already\s+(?:been\s+)?(?:voted|submitted)|duplicate\s+vote/i.test(
    message,
  );
}
