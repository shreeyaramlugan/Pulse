"use client";

type ProjectSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function ProjectSearch({
  value,
  onChange,
}: ProjectSearchProps) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search projects..."
        className="w-full rounded-xl border bg-transparent px-4 py-3 pl-11 text-sm outline-none transition focus:ring-2"
      />

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="11"
          cy="11"
          r="8"
        />
        <path d="m21 21-4.35-4.35" />
      </svg>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm opacity-50 transition hover:opacity-100"
          aria-label="Clear project search"
        >
          ×
        </button>
      )}
    </div>
  );
}
