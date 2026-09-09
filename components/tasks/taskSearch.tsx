"use client";

type TaskSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TaskSearch({
  value,
  onChange,
}: TaskSearchProps) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search tasks..."
        className="w-full rounded-xl border px-4 py-3 pr-10 outline-none transition focus:ring-2"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}