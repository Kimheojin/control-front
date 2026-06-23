import { formatDateTime } from "@/lib/format";
import type { BusEvent, BusEventType } from "@/types/event";

const EVENT_LABELS: Record<BusEventType, string> = {
  SUDDEN_BRAKE: "급정거",
  RAPID_ACCELERATION: "급가속",
  IMPACT: "충격",
  OTHER: "기타",
};

interface EventItemProps {
  event: BusEvent;
}

export function EventItem({ event }: EventItemProps) {
  return (
    <li className="border-b border-slate-200 px-4 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
          {EVENT_LABELS[event.type]}
        </span>
        <time className="text-xs text-slate-500">
          {formatDateTime(event.occurredAt)}
        </time>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-900">
        {event.description}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {event.location.latitude.toFixed(5)},{" "}
        {event.location.longitude.toFixed(5)}
      </p>
    </li>
  );
}
