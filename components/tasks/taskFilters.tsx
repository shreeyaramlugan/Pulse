"use client";

import type { TaskFilters } from "./taskPage";

type Props = {
  filters: TaskFilters;

  onChange: (
    key: keyof TaskFilters,
    value: string
  ) => void;

  onClear: () => void;

  hasFilters: boolean;
};

export default function TaskFilters({
  filters,
  onChange,
  onClear,
  hasFilters,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status */}
      <select
        value={filters.status}
        onChange={(event) =>
          onChange("status", event.target.value)
        }
        className="rounded-xl border px-4 py-2.5"
      >
        <option value="">All statuses</option>
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">
          In progress
        </option>
        <option value="COMPLETED">
          Completed
        </option>
        <option value="CANCELLED">
          Cancelled
        </option>
        <option value="ARCHIVED">
          Archived
        </option>
      </select>

      {/* Priority */}
      <select
        value={filters.priority}
        onChange={(event) =>
          onChange(
            "priority",
            event.target.value
          )
        }
        className="rounded-xl border px-4 py-2.5"
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>

      {/* Due */}
<select
  value={filters.due}
  onChange={(event) =>
    onChange("due", event.target.value)
  }
  className="rounded-xl border px-4 py-2.5"
>
  <option value="">Any due date</option>
  <option value="today">Today</option>
  <option value="tomorrow">Tomorrow</option>
  <option value="this-week">This week</option>
  <option value="this-month">This month</option>
  <option value="overdue">Overdue</option>
</select>

      {/* Clear */}
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-2 text-sm underline opacity-70 hover:opacity-100"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}