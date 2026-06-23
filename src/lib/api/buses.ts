import { apiFetch } from "@/lib/api/client";
import type { BusDetail, BusListParams, BusPage } from "@/types/bus";

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildBusListSearchParams(params?: BusListParams) {
  const searchParams = new URLSearchParams();

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (typeof params?.routeId === "number") {
    searchParams.set("routeId", String(params.routeId));
  }

  const keyword = params?.keyword?.trim();
  if (keyword) {
    searchParams.set("keyword", keyword);
  }

  searchParams.set("page", String(Math.max(params?.page ?? DEFAULT_PAGE, 0)));
  searchParams.set(
    "size",
    String(clamp(params?.size ?? DEFAULT_SIZE, 1, 100)),
  );

  return searchParams;
}

export async function getBuses(
  params?: BusListParams,
  signal?: AbortSignal,
): Promise<BusPage> {
  const searchParams = buildBusListSearchParams(params);
  return apiFetch<BusPage>(`/buses?${searchParams.toString()}`, { signal });
}

export async function getBusDetail(
  busId: number,
  signal?: AbortSignal,
): Promise<BusDetail> {
  return apiFetch<BusDetail>(`/buses/${busId}`, { signal });
}
