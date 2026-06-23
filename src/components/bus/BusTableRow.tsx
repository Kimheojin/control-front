import { formatDateTime, formatSpeed } from "@/lib/format";
import type { BusSummary } from "@/types/bus";
import { BusStatusBadge } from "@/components/bus/BusStatusBadge";

interface BusTableRowProps {
  bus: BusSummary;
  onClick: (busId: number) => void;
}

export function BusTableRow({ bus, onClick }: BusTableRowProps) {
  return (
    <tr
      className="cursor-pointer border-b border-slate-200 transition hover:bg-slate-50"
      onClick={() => onClick(bus.id)}
    >
      <td className="px-4 py-3 font-semibold text-slate-950">
        {bus.busNumber}
      </td>
      <td className="px-4 py-3 text-slate-700">{bus.routeName}</td>
      <td className="px-4 py-3 text-slate-700">
        {formatSpeed(bus.currentSpeed)}
      </td>
      <td className="px-4 py-3">
        <BusStatusBadge status={bus.status} />
      </td>
      <td className="px-4 py-3 text-slate-600">
        {formatDateTime(bus.lastCommunicatedAt)}
      </td>
    </tr>
  );
}
