import { BusTableRow } from "@/components/bus/BusTableRow";
import type { BusSummary } from "@/types/bus";

interface BusTableProps {
  buses: BusSummary[];
  onSelectBus: (busId: number) => void;
}

export function BusTable({ buses, onSelectBus }: BusTableProps) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">버스번호</th>
            <th className="px-4 py-3">노선명</th>
            <th className="px-4 py-3">현재속도</th>
            <th className="px-4 py-3">현재상태</th>
            <th className="px-4 py-3">마지막 통신시간</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <BusTableRow key={bus.id} bus={bus} onClick={onSelectBus} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
