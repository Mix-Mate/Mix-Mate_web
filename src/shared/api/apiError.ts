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
