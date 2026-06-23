"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { use, useCallback } from "react";
import { BusSummaryCard } from "@/components/bus/BusSummaryCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { EventList } from "@/components/event/EventList";
import { getBusDetail } from "@/lib/api/buses";
import { getBusEvents } from "@/lib/api/events";
import { usePolling } from "@/lib/polling";

const BusMap = dynamic(() => import("@/components/map/BusMap"), {
  ssr: false,
  loading: () => <Loading label="지도를 불러오는 중입니다." />,
});

interface BusDetailPageProps {
  params: Promise<{
    busId: string;
  }>;
}

export default function BusDetailPage({ params }: BusDetailPageProps) {
  const { busId: busIdParam } = use(params);
  const busId = Number(busIdParam);

  return <BusDetailContent busId={busId} />;
}

function BusDetailContent({ busId }: { busId: number }) {
  const detailFetcher = useCallback(
    (signal: AbortSignal) => getBusDetail(busId, signal),
    [busId],
  );
  const eventFetcher = useCallback(
    (signal: AbortSignal) => getBusEvents(busId, 10, signal),
    [busId],
  );

  const detailState = usePolling({
    enabled: Number.isFinite(busId) && busId > 0,
    fetcher: detailFetcher,
  });
  const eventState = usePolling({
    enabled: Number.isFinite(busId) && busId > 0,
    fetcher: eventFetcher,
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            className="text-sm font-semibold text-teal-700 hover:text-teal-900"
            href="/"
          >
            목록으로 이동
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
            버스 상세
          </h1>
        </div>
        <div className="text-sm font-medium text-slate-600">
          {detailState.isRefreshing || eventState.isRefreshing
            ? "갱신 중"
            : "5초 자동 갱신"}
        </div>
      </header>

      {detailState.errorMessage ? (
        <ErrorMessage message={detailState.errorMessage} />
      ) : null}

      {detailState.isLoading && !detailState.data ? (
        <Loading label="버스 상세 정보를 불러오는 중입니다." />
      ) : detailState.data ? (
        <>
          <BusSummaryCard bus={detailState.data} />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-slate-950">현재 위치</h2>
              {detailState.data.currentLocation ? (
                <BusMap location={detailState.data.currentLocation} />
              ) : (
                <EmptyState
                  title="현재 위치 정보가 없습니다."
                  description="버스가 위치 데이터를 전송하면 지도에 표시됩니다."
                />
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-950">최근 이벤트</h2>
                {eventState.isRefreshing ? (
                  <span className="text-xs font-semibold text-slate-500">
                    갱신 중
                  </span>
                ) : null}
              </div>
              {eventState.errorMessage ? (
                <ErrorMessage message={eventState.errorMessage} />
              ) : null}
              {eventState.isLoading && !eventState.data ? (
                <Loading label="최근 이벤트를 불러오는 중입니다." />
              ) : (
                <EventList events={eventState.data?.events ?? []} />
              )}
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          title="버스를 찾을 수 없습니다."
          description="목록으로 돌아가 다른 버스를 선택해 주세요."
        />
      )}
    </main>
  );
}
