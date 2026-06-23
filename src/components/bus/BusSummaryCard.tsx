import { BusStatusBadge } from "@/components/bus/BusStatusBadge";
import { formatDateTime, formatSpeed } from "@/lib/format";
import type { BusDetail } from "@/types/bus";

interface BusSummaryCardProps {
  bus: BusDetail;
}

export function BusSummaryCard({ bus }: BusSummaryCardProps) {
  return (
    <section className="grid gap-4 rounded border border-slate-200 bg-white p-5 md:grid-cols-5">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">버스번호</p>
        <p className="mt-2 text-xl font-bold text-slate-950">{bus.busNumber}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">노선명</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {bus.route.name}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">현재속도</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {formatSpeed(bus.currentSpeed)}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">상태</p>
        <div className="mt-2">
          <BusStatusBadge status={bus.status} />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">
          마지막 통신
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          {formatDateTime(bus.lastCommunicatedAt)}
        </p>
      </div>
    </section>
  );
}
