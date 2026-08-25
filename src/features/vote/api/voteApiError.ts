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
