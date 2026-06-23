export function Loading({ label = "불러오는 중입니다." }: { label?: string }) {
  return (
    <div
      className="flex min-h-32 items-center justify-center rounded border border-dashed border-slate-300 bg-white text-sm text-slate-600"
      role="status"
    >
      {label}
    </div>
  );
}
