import type { BusStatus } from "@/types/bus";

interface BusStatusBadgeProps {
  status: BusStatus;
}

export function BusStatusBadge({ status }: BusStatusBadgeProps) {
  const isOnline = status === "ONLINE";

  return (
    <span
      className={[
        "inline-flex min-w-24 items-center justify-center rounded px-2.5 py-1 text-xs font-semibold",
        isOnline
          ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border border-slate-300 bg-slate-100 text-slate-700",
      ].join(" ")}
    >
      <span
        className={[
          "mr-1.5 h-2 w-2 rounded-full",
          isOnline ? "bg-emerald-500" : "bg-slate-500",
        ].join(" ")}
        aria-hidden="true"
      />
      {status}
    </span>
  );
}
