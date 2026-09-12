"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import GoalSearch from "@/components/goals/goalSearch";
import GoalFilters from "@/components/goals/goalFilters";
import GoalList from "@/components/goals/goalList";
import GoalModal from "@/components/goals/goalModal";

export type Goal = {
id: string;
title: string;
description: string | null;

parentGoalId: string | null;

period:
| "DAILY"
| "WEEKLY"
| "MONTHLY"
| "QUARTERLY"
| "ANNUAL";

status:
| "ACTIVE"
| "COMPLETED"
| "PAUSED"
| "CANCELLED"
| "ARCHIVED";

priority:
| "LOW"
| "MEDIUM"
| "HIGH"
| "URGENT";

progressType:
| "MANUAL"
| "METRIC"
| "SUBGOALS";

metricType:
| "NUMBER"
| "CURRENCY"
| "PERCENTAGE"
| "HOURS"
| "MINUTES"
| "CUSTOM"
| null;

metricName: string | null;
unit: string | null;

metricDirection:
| "INCREASE"
| "DECREASE";

startValue: number | string | null;
currentValue: number | string | null;
targetValue: number | string | null;

startDate: string | null;
targetDate: string | null;
completedAt: string | null;

createdAt: string;
updatedAt: string;

parentGoal?: {
id: string;
title: string;
status: string;
} | null;
subGoals: {
  id: string;
  title: string;
  description: string | null;
  status:
    | "ACTIVE"
    | "COMPLETED"
    | "PAUSED"
    | "CANCELLED"
    | "ARCHIVED";
  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";
  targetDate: string | null;
  parentGoalId: string | null;
}[];
_count: {
subGoals: number;
tasks: number;
progressEntries: number;
};
};

export type GoalFilters = {
status: string;
priority: string;
period: string;
progressType: string;
};

export default function GoalsPage() {
const [goals, setGoals] = useState<Goal[]>(
[]
);

const [search, setSearch] =
useState("");

const [filters, setFilters] =
useState<GoalFilters>({
status: "",
priority: "",
period: "",
progressType: "",
});

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState<string | null>(null);

const [modalOpen, setModalOpen] =
  useState(false);

const [editingGoal, setEditingGoal] =
  useState<Goal | null>(null);

const [parentGoal, setParentGoal] =
  useState<Goal | null>(null);

const [pagination, setPagination] =
useState({
page: 1,
limit: 50,
total: 0,
totalPages: 1,
hasNextPage: false,
hasPreviousPage: false,
});


 /*                                                                         |
| -------------------------------------------------------------------------- |
| Fetch goals                                                                |
| -------------------------------------------------------------------------- |
*/


const fetchGoals = useCallback(
async (page = 1) => {
try {
setLoading(true);
setError(null);

    const params =
      new URLSearchParams();

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    }

    if (filters.status) {
      params.set(
        "status",
        filters.status
      );
    }

    if (filters.priority) {
      params.set(
        "priority",
        filters.priority
      );
    }

    if (filters.period) {
      params.set(
        "period",
        filters.period
      );
    }

    if (filters.progressType) {
      params.set(
        "progressType",
        filters.progressType
      );
    }

    params.set(
      "page",
      String(page)
    );

    params.set(
      "limit",
      "50"
    );

    const response =
      await fetch(
        `/api/goals?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load goals."
      );
    }

    setGoals(
      data.data || []
    );

    setPagination(
      data.pagination || {
        page: 1,
        limit: 50,
        total:
          data.data?.length || 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    );
  } catch (err) {
    console.error(err);

    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
},
[search, filters]

);

/*                                                                         |
| -------------------------------------------------------------------------- |
| Initial fetch / search                                                     |
| -------------------------------------------------------------------------- |
*/


useEffect(() => {
const timeout =
setTimeout(() => {
fetchGoals(1);
}, 300);


return () =>
  clearTimeout(timeout);


}, [fetchGoals]);

/*                                                                         |
| -------------------------------------------------------------------------- |
| Filters                                                                    |
| -------------------------------------------------------------------------- |
*/


function updateFilter(
key: keyof GoalFilters,
value: string
) {
setFilters(
(current) => ({
...current,
[key]: value,
})
);
}

function clearFilters() {
setSearch("");

setFilters({
  status: "",
  priority: "",
  period: "",
  progressType: "",
});


}

const hasFilters =
Boolean(search) ||
Object.values(filters).some(
Boolean
);

/*                                                                         |
| -------------------------------------------------------------------------- |
| Create goal                                                                |
| -------------------------------------------------------------------------- |
*/


function openCreateModal() {
  setEditingGoal(null);
  setParentGoal(null);
  setModalOpen(true);
}

/*                                                                         |
| -------------------------------------------------------------------------- |
| Edit goal                                                                  |
| -------------------------------------------------------------------------- |
*/



function openEditModal(goal: Goal) {
  setEditingGoal(goal);
  setParentGoal(null);
  setModalOpen(true);
}

function openAddSubGoalModal(goal: Goal) {
  setEditingGoal(null);
  setParentGoal(goal);
  setModalOpen(true);
}
function openEditSubGoalModal(
  subGoal: Goal
) {
  setEditingGoal(subGoal);
  setParentGoal(null);
  setModalOpen(true);
}
/*                                                                         |
| -------------------------------------------------------------------------- |
| Delete goal                                                                |
| -------------------------------------------------------------------------- |
| */


async function deleteGoal(
goalId: string
) {
const confirmed =
window.confirm(
"Are you sure you want to delete this goal?"
);


if (!confirmed) return;

try {
  setError(null);

  const response =
    await fetch(
      `/api/goals/${goalId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to delete goal."
    );
  }

  setGoals(
    (current) =>
      current.filter(
        (goal) =>
          goal.id !== goalId
      )
  );

  setPagination(
    (current) => ({
      ...current,
      total: Math.max(
        current.total - 1,
        0
      ),
    })
  );
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "Failed to delete goal."
  );
}


}

/*                                                                         |
| -------------------------------------------------------------------------- |
| Toggle completed status                                                    |
| -------------------------------------------------------------------------- |
*/


async function toggleGoal(
goal: Goal
) {
try {
setError(null);


  const newStatus =
    goal.status === "COMPLETED"
      ? "ACTIVE"
      : "COMPLETED";

  const response =
    await fetch(
      `/api/goals/${goal.id}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update goal."
    );
  }

  setGoals(
    (current) =>
      current.map(
        (item) =>
          item.id === goal.id
            ? {
                ...item,
                ...data.data,
              }
            : item
      )
  );
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "Failed to update goal."
  );
}

}
async function toggleSubGoal(
  subGoal: Goal
) {
  try {
    setError(null);

    const newStatus =
      subGoal.status === "COMPLETED"
        ? "ACTIVE"
        : "COMPLETED";

    const response = await fetch(
      `/api/goals/${subGoal.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to update sub-goal."
      );
    }

    // Reload goals so the parent goal's
    // sub-goal progress is also updated.
    await fetchGoals(
      pagination.page
    );
  } catch (err) {
    console.error(err);

    setError(
      err instanceof Error
        ? err.message
        : "Failed to update sub-goal."
    );
  }
}
/*                                                                         |
| -------------------------------------------------------------------------- |
| Render                                                                     |
| -------------------------------------------------------------------------- |
*/


return ( <main className="min-h-screen px-6 py-8"> <div className="mx-auto max-w-7xl">

    {/* Header */}
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-wider opacity-60">
          Productivity
        </p>

        <h1 className="text-3xl font-bold">
          Goals
        </h1>

        <p className="mt-2 opacity-60">
          Turn bigger ambitions into
          something you can actually
          work toward.
        </p>
      </div>

      <button
        type="button"
        onClick={openCreateModal}
        className="rounded-xl px-5 py-3 font-medium"
      >
        + New Goal
      </button>
    </div>

    {/* Search */}
    <div className="mb-4">
      <GoalSearch
        value={search}
        onChange={setSearch}
      />
    </div>

    {/* Filters */}
    <div className="mb-6">
      <GoalFilters
        filters={filters}
        onChange={updateFilter}
        onClear={clearFilters}
        hasFilters={hasFilters}
      />
    </div>

    {/* Error */}
    {error && (
      <div className="mb-6 rounded-xl border border-red-300 p-4 text-sm">
        {error}
      </div>
    )}

    {/* Goal count */}
    {!loading && (
      <div className="mb-4 text-sm opacity-60">
        {pagination.total}{" "}
        {pagination.total === 1
          ? "goal"
          : "goals"}
      </div>
    )}

    {/* Goal list */}
{/* Goal list */}
<GoalList
  goals={goals}
  loading={loading}
  onToggle={toggleGoal}
  onDelete={deleteGoal}
  onEdit={openEditModal}
  onAddSubGoal={openAddSubGoalModal}
  onToggleSubGoal={toggleSubGoal}
  onEditSubGoal={openEditSubGoalModal}
/>

{/* Pagination */}
{!loading &&
  pagination.totalPages > 1 && (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        disabled={
          !pagination.hasPreviousPage
        }
        onClick={() =>
          fetchGoals(
            pagination.page - 1
          )
        }
        className="rounded-lg border px-4 py-2 disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-sm opacity-60">
        Page {pagination.page} of{" "}
        {pagination.totalPages}
      </span>

      <button
        disabled={
          !pagination.hasNextPage
        }
        onClick={() =>
          fetchGoals(
            pagination.page + 1
          )
        }
        className="rounded-lg border px-4 py-2 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )}
</div>

{/* Create / Edit / Sub-goal Modal */}
<GoalModal
  open={modalOpen}
  onClose={() => {
    setModalOpen(false);
    setEditingGoal(null);
    setParentGoal(null);
  }}
  goal={editingGoal}
  parentGoal={parentGoal}
  onCreated={() => {
    setModalOpen(false);
    setEditingGoal(null);
    setParentGoal(null);
    fetchGoals(1);
  }}
  onUpdated={() => {
    setModalOpen(false);
    setEditingGoal(null);
    setParentGoal(null);
    fetchGoals(pagination.page);
  }}
/>
</main>


);
}
