import { EmptyState } from "@/components/common/EmptyState";
import { EventItem } from "@/components/event/EventItem";
import type { BusEvent } from "@/types/event";

interface EventListProps {
  events: BusEvent[];
}

export function EventList({ events }: EventListProps) {
  const sortedEvents = [...events].sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() -
      new Date(left.occurredAt).getTime(),
  );

  if (sortedEvents.length === 0) {
    return (
      <EmptyState
        title="최근 이벤트가 없습니다."
        description="이 버스에서 감지된 최근 이벤트가 없습니다."
      />
    );
  }

  return (
    <ul className="overflow-hidden rounded border border-slate-200 bg-white">
      {sortedEvents.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </ul>
  );
}
