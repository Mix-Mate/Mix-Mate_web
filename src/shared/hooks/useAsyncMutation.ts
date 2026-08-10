"use client";

import { useCallback, useState } from "react";

interface UseAsyncMutationOptions<TFallback> {
  fallbackErrorMessage: string;
  fallbackResult: TFallback;
}

export default function useAsyncMutation<
  TArguments extends unknown[],
  TResult,
  TFallback,
>(
  mutationFn: (...args: TArguments) => Promise<TResult>,
  { fallbackErrorMessage, fallbackResult }: UseAsyncMutationOptions<TFallback>,
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: TArguments): Promise<TResult | TFallback> => {
      setIsPending(true);
      setError(null);

      try {
        return await mutationFn(...args);
      } catch (mutationError) {
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : fallbackErrorMessage,
        );
        return fallbackResult;
      } finally {
        setIsPending(false);
      }
    },
    [fallbackErrorMessage, fallbackResult, mutationFn],
  );

  return { mutate, isPending, error };
}
