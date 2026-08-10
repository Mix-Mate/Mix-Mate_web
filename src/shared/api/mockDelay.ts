export function mockDelay(durationMs = 450) {
  return new Promise<void>((resolve) => setTimeout(resolve, durationMs));
}
