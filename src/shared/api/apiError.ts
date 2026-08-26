import { getAccessToken } from "./authToken";

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function createApiRequestError(
  response: Response,
  fallbackMessage: string,
) {
  try {
    const body = (await response.json()) as { message?: string };
    return new ApiRequestError(response.status, body.message ?? fallbackMessage);
  } catch {
    return new ApiRequestError(response.status, fallbackMessage);
  }
}

export function shouldUseMockFallback(error: unknown) {
  if (!getAccessToken()) return true;
  if (error instanceof TypeError) return true;
  if (error instanceof ApiRequestError && error.status === 401) return true;

  return false;
}
