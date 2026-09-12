"use client";

type GoalSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function GoalSearch({
  value,
  onChange,
}: GoalSearchProps) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search goals..."
        className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
      />
    </div>
  );
}