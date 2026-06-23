"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage, isRequestAbort } from "@/lib/api/client";

const BACKOFF_DELAYS = [5000, 10000, 20000, 30000] as const;

interface PollingState<T> {
  data: T | null;
  errorMessage: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
}

interface UsePollingOptions<T> {
  enabled?: boolean;
  fetcher: (signal: AbortSignal) => Promise<T>;
  keepPreviousData?: boolean;
}

export function usePolling<T>({
  enabled = true,
  fetcher,
  keepPreviousData = true,
}: UsePollingOptions<T>) {
  const [state, setState] = useState<PollingState<T>>({
    data: null,
    errorMessage: null,
    isLoading: enabled,
    isRefreshing: false,
  });
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const failureCountRef = useRef(0);
  const requestIdRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(
    (run: () => void) => {
      clearTimer();

      if (!enabled || document.visibilityState !== "visible") {
        return;
      }

      const delay =
        BACKOFF_DELAYS[
          Math.min(failureCountRef.current, BACKOFF_DELAYS.length - 1)
        ];
      timerRef.current = window.setTimeout(run, delay);
    },
    [clearTimer, enabled],
  );

  const run = useCallback(async () => {
    if (!enabled || inFlightRef.current || document.visibilityState !== "visible") {
      return;
    }

    inFlightRef.current = true;
    abortRef.current?.abort();
    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortRef.current = controller;

    setState((current) => ({
      ...current,
      errorMessage: null,
      isLoading: current.data === null,
      isRefreshing: current.data !== null,
      data: keepPreviousData ? current.data : null,
    }));

    try {
      const data = await fetcher(controller.signal);
      failureCountRef.current = 0;

      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        setState({
          data,
          errorMessage: null,
          isLoading: false,
          isRefreshing: false,
        });
      }
    } catch (error) {
      if (!isRequestAbort(error) && requestId === requestIdRef.current) {
        failureCountRef.current += 1;
        setState((current) => ({
          ...current,
          errorMessage: getErrorMessage(error),
          isLoading: false,
          isRefreshing: false,
        }));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        inFlightRef.current = false;
        scheduleNext(run);
      }
    }
  }, [enabled, fetcher, keepPreviousData, scheduleNext]);

  useEffect(() => {
    if (enabled) {
      run();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        run();
      } else {
        clearTimer();
        abortRef.current?.abort();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      requestIdRef.current += 1;
      inFlightRef.current = false;
      clearTimer();
      abortRef.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearTimer, enabled, run]);

  return {
    ...state,
    refetch: run,
  };
}
