import { apiFetch } from "@/lib/api/client";
import type { BusEventResponse } from "@/types/event";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export async function getBusEvents(
  busId: number,
  limit = 10,
  signal?: AbortSignal,
): Promise<BusEventResponse> {
  const searchParams = new URLSearchParams({
    limit: String(clamp(limit, 1, 100)),
  });

  return apiFetch<BusEventResponse>(
    `/buses/${busId}/events?${searchParams.toString()}`,
    { signal },
  );
}
