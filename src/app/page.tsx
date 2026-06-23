"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BusTable } from "@/components/bus/BusTable";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { SearchInput } from "@/components/common/SearchInput";
import { getBuses } from "@/lib/api/buses";
import { usePolling } from "@/lib/polling";
import type { BusStatus } from "@/types/bus";

const PAGE_SIZE = 20;

type StatusFilter = BusStatus | "ALL";

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(0);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword]);

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      getBuses(
        {
          keyword: debouncedKeyword,
          page,
          size: PAGE_SIZE,
          status: status === "ALL" ? undefined : status,
        },
        signal,
      ),
    [debouncedKeyword, page, status],
  );

  const { data, errorMessage, isLoading, isRefreshing } = usePolling({
    fetcher,
  });

  const totalPages = data?.totalPages ?? 0;
  const canGoPrevious = page > 0;
  const canGoNext = data ? page + 1 < totalPages : false;

  const pageSummary = useMemo(() => {
    if (!data) {
      return "총 0대";
    }

    return `총 ${data.totalElements.toLocaleString("ko-KR")}대 / ${
      data.page + 1
    }/${Math.max(data.totalPages, 1)} 페이지`;
  }, [data]);

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatus(nextStatus);
    setPage(0);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-teal-700">Bus Control</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">
              버스 관제 대시보드
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              상태, 속도, 마지막 통신시간을 현재 조건 기준으로 확인합니다.
            </p>
          </div>
          <div className="text-sm font-medium text-slate-600">
            {isRefreshing ? "갱신 중" : "5초 자동 갱신"}
          </div>
        </div>
      </header>

      <section className="flex flex-wrap items-end gap-4 rounded border border-slate-200 bg-white p-4">
        <SearchInput value={keyword} onChange={setKeyword} />
        <fieldset className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <legend>상태 필터</legend>
          <div className="flex overflow-hidden rounded border border-slate-300">
            {(["ALL", "ONLINE", "OFFLINE"] as const).map((item) => (
              <button
                key={item}
                aria-pressed={status === item}
                className={[
                  "h-10 px-4 text-sm font-semibold transition",
                  status === item
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100",
                ].join(" ")}
                type="button"
                onClick={() => handleStatusChange(item)}
              >
                {item === "ALL" ? "전체" : item}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">{pageSummary}</p>
          <div className="flex gap-2">
            <button
              aria-label="이전 페이지"
              className="h-9 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canGoPrevious}
              type="button"
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
            >
              이전
            </button>
            <button
              aria-label="다음 페이지"
              className="h-9 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canGoNext}
              type="button"
              onClick={() => setPage((current) => current + 1)}
            >
              다음
            </button>
          </div>
        </div>

        {isLoading && !data ? (
          <Loading label="버스 목록을 불러오는 중입니다." />
        ) : data && data.content.length > 0 ? (
          <BusTable
            buses={data.content}
            onSelectBus={(busId) => router.push(`/buses/${busId}`)}
          />
        ) : (
          <EmptyState
            title="조회된 버스가 없습니다."
            description="검색어 또는 상태 필터를 변경해 보세요."
          />
        )}
      </section>
    </main>
  );
}
