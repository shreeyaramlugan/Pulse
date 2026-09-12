"use client";

import { useCallback, useEffect, useState } from "react";

import GoalSearch from "./goalSearch";
import GoalFilters from "./goalFilters";
import GoalList from "./goalList";
import GoalModal from "./goalModal";

export type Goal = {
  id: string;
  parentGoalId: string | null;

  title: string;
  description: string | null;

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

  startValue: number | null;
  currentValue: number | null;
  targetValue: number | null;

  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;

  createdAt: string;
  updatedAt: string;

  subGoals?: Goal[];

  _count?: {
    subGoals: number;
    tasks: number;
    progressEntries: number;
  };
};

export type GoalFilters = {
  status: string;
  priority: string;
  period: string;
};

export default function GoalPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<GoalFilters>({
    status: "",
    priority: "",
    period: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [goalModalOpen, setGoalModalOpen] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState<Goal | null>(null);

  const [parentGoal, setParentGoal] =
    useState<Goal | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  

  const fetchGoals = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (filters.status) {
          params.set("status", filters.status);
        }

        if (filters.priority) {
          params.set("priority", filters.priority);
        }

        if (filters.period) {
          params.set("period", filters.period);
        }

        params.set("page", String(page));
        params.set("limit", "50");

        const response = await fetch(
          `/api/goals?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load goals."
          );
        }

        setGoals(data.data);
        setPagination(data.pagination);
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchGoals(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchGoals]);

  function updateFilter(
    key: keyof GoalFilters,
    value: string
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearFilters() {
    setSearch("");

    setFilters({
      status: "",
      priority: "",
      period: "",
    });
  }

function openCreateModal() {
  setEditingGoal(null);
  setParentGoal(null);
  setModalOpen(true);
}

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

  function openSubGoalModal(goal: Goal) {
    setEditingGoal(null);
    setParentGoal(goal);
    setGoalModalOpen(true);
  }

  async function deleteGoal(goalId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/goals/${goalId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete goal."
        );
      }

      setGoals((current) =>
        current.filter(
          (goal) => goal.id !== goalId
        )
      );

      setPagination((current) => ({
        ...current,
        total: Math.max(current.total - 1, 0),
      }));
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete goal."
      );
    }
  }

  const hasFilters =
    Boolean(search) ||
    Object.values(filters).some(Boolean);

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">

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
              Turn bigger ambitions into achievable milestones.
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

        {/* Count */}
        {!loading && (
          <div className="mb-4 text-sm opacity-60">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "goal"
              : "goals"}
          </div>
        )}

        {/* Goals */}
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

    <GoalModal
  open={modalOpen}
  onClose={() =>
    setModalOpen(false)
  }
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
    fetchGoals(
      pagination.page
    );
  }}
/>
    </main>
  );
}
