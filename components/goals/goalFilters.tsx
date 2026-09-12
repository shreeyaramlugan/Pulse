"use client";

import { GoalFilters as GoalFilterState } from "./goalPage";

type Props = {
  filters: GoalFilterState;
  onChange: (
    key: keyof GoalFilterState,
    value: string
  ) => void;
  onClear: () => void;
  hasFilters: boolean;
};

export default function GoalFilters({
  filters,
  onChange,
  onClear,
  hasFilters,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">

      <select
        value={filters.status}
        onChange={(e) =>
          onChange("status", e.target.value)
        }
        className="rounded-lg border bg-transparent px-3 py-2"
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="PAUSED">Paused</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="ARCHIVED">Archived</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) =>
          onChange("priority", e.target.value)
        }
        className="rounded-lg border bg-transparent px-3 py-2"
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      <select
        value={filters.period}
        onChange={(e) =>
          onChange("period", e.target.value)
        }
        className="rounded-lg border bg-transparent px-3 py-2"
      >
        <option value="">All periods</option>
        <option value="DAILY">Daily</option>
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
        <option value="QUARTERLY">Quarterly</option>
        <option value="ANNUAL">Annual</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Clear
        </button>
      )}
    </div>
  );
}