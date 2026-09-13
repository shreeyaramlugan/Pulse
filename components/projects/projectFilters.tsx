"use client";

import type {
  ProjectFilters as ProjectFilterType,
} from "./projectModel";

type ProjectFiltersProps = {
  filters: ProjectFilterType;

  onChange: (
    key: keyof ProjectFilterType,
    value: string
  ) => void;

  onClear: () => void;

  hasFilters: boolean;
};

export default function ProjectFilters({
  filters,
  onChange,
  onClear,
  hasFilters,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">

      {/* Status */}

      <select
        value={filters.status}
        onChange={(event) =>
          onChange(
            "status",
            event.target.value
          )
        }
        className="rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none"
      >
        <option value="">
          All statuses
        </option>

        <option value="PLANNING">
          Planning
        </option>

        <option value="ACTIVE">
          Active
        </option>

        <option value="ON_HOLD">
          On Hold
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
        className="rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none"
      >
        <option value="">
          All priorities
        </option>

        <option value="LOW">
          Low
        </option>

        <option value="MEDIUM">
          Medium
        </option>

        <option value="HIGH">
          High
        </option>

        <option value="URGENT">
          Urgent
        </option>
      </select>

      {/* Deadline */}

      <select
        value={filters.deadline}
        onChange={(event) =>
          onChange(
            "deadline",
            event.target.value
          )
        }
        className="rounded-xl border bg-transparent px-4 py-2.5 text-sm outline-none"
      >
        <option value="">
          All deadlines
        </option>

        <option value="OVERDUE">
          Overdue
        </option>

        <option value="TODAY">
          Due today
        </option>

        <option value="THIS_WEEK">
          Due this week
        </option>

        <option value="THIS_MONTH">
          Due this month
        </option>

        <option value="NO_DEADLINE">
          No deadline
        </option>
      </select>

      {/* Clear */}

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border px-4 py-2.5 text-sm opacity-70 transition hover:opacity-100"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
