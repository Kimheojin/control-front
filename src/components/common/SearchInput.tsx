interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <label className="flex min-w-72 flex-col gap-2 text-sm font-medium text-slate-700">
      버스번호 또는 노선명 검색
      <input
        aria-label="버스번호 또는 노선명 검색"
        className="h-10 rounded border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
        placeholder="예: 서울74사1234, 271번"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
