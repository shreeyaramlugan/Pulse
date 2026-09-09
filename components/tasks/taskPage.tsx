"use client";

import { useCallback, useEffect, useState } from "react";
import TaskSearch from "./taskSearch";
import TaskFilters from "./taskFilters";
import TaskList from "./taskList";
import CreateTaskModal from "./createTaskModal";

export type Task = {
  id: string;
  title: string;
  description: string | null;

  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "ARCHIVED";

  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";

  dueDate: string | null;

  estimatedMinutes: number | null;
  actualMinutes: number | null;

  completedAt: string | null;

  createdAt: string;
  updatedAt: string;

  project: {
    id: string;
    name: string;
    status: string;
  } | null;

  goal: {
    id: string;
    title: string;
    targetDate: string | null;
  } | null;

  recurrence: {
    id: string;
    frequency:
      | "DAILY"
      | "WEEKLY"
      | "MONTHLY"
      | "YEARLY";
    interval: number;
    daysOfWeek: number[];
    startDate: string;
    endDate: string | null;
    nextRunAt: string | null;
  } | null;

  reminders: {
    id: string;
    title: string;
    remindAt: string;
    status: string;
  }[];

  subtasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    completedAt: string | null;
  }[];

  _count: {
    subtasks: number;
  };
};

export type TaskFilters = {
  status: string;
  priority: string;
  projectId: string;
  goalId: string;
  due: string;
};

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<TaskFilters>({
    status: "",
    priority: "",
    projectId: "",
    goalId: "",
    due: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [createModalOpen, setCreateModalOpen] =
  useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchTasks = useCallback(
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

        if (filters.projectId) {
          params.set("projectId", filters.projectId);
        }

        if (filters.goalId) {
          params.set("goalId", filters.goalId);
        }

       // Due date filter
if (filters.due) {
  params.set("due", filters.due);
}

        params.set("page", String(page));
        params.set("limit", "50");

        const response = await fetch(
          `/api/tasks?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load tasks."
          );
        }

        setTasks(data.data);
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
      fetchTasks(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchTasks]);

  function updateFilter(
    key: keyof TaskFilters,
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
      projectId: "",
      goalId: "",
      due: "",
    });
  }

  async function toggleTask(task: Task) {
    try {
      const newStatus =
        task.status === "COMPLETED"
          ? "TODO"
          : "COMPLETED";

      const response = await fetch(
        `/api/tasks/${task.id}`,
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
          data.message || "Failed to update task."
        );
      }

      // Update locally without refetching
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? data.data
            : item
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update task."
      );
    }
  }

  async function deleteTask(taskId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/tasks/${taskId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete task."
        );
      }

      setTasks((current) =>
        current.filter(
          (task) => task.id !== taskId
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
          : "Failed to delete task."
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
              Tasks
            </h1>

            <p className="mt-2 opacity-60">
              Stay on top of everything you need to get done.
            </p>
          </div>

<button
  type="button"
  onClick={() => setCreateModalOpen(true)}
  className="rounded-xl px-5 py-3 font-medium"
>
  + New Task
</button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <TaskSearch
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TaskFilters
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

        {/* Task count */}
        {!loading && (
          <div className="mb-4 text-sm opacity-60">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "task"
              : "tasks"}
          </div>
        )}

        {/* Tasks */}
        <TaskList
          tasks={tasks}
          loading={loading}
          onToggle={toggleTask}
          onDelete={deleteTask}
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
                  fetchTasks(
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
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  fetchTasks(
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
      <CreateTaskModal
  open={createModalOpen}
  onClose={() =>
    setCreateModalOpen(false)
  }
  onCreated={() => fetchTasks(1)}
/>
    </main>
  );
}