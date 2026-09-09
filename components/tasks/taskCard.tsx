"use client";

import type { Task } from "./taskPage";

type Props = {
  task: Task;

  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

function formatDueDate(date: string | null) {
  if (!date) return null;

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function isOverdue(
  date: string | null,
  status: string
) {
  if (!date || status === "COMPLETED") {
    return false;
  }

  return new Date(date) < new Date();
}

export default function TaskCard({
  task,
  onToggle,
  onDelete,
}: Props) {
  const overdue = isOverdue(
    task.dueDate,
    task.status
  );

  return (
    <article className="rounded-2xl border p-5 transition hover:shadow-sm">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(task)}
          aria-label={
            task.status === "COMPLETED"
              ? "Mark task as incomplete"
              : "Mark task as complete"
          }
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            task.status === "COMPLETED"
              ? "border-current"
              : ""
          }`}
        >
          {task.status === "COMPLETED" && "✓"}
        </button>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3
                className={`font-semibold ${
                  task.status === "COMPLETED"
                    ? "line-through opacity-50"
                    : ""
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="mt-1 text-sm opacity-60">
                  {task.description}
                </p>
              )}
            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={() =>
                onDelete(task.id)
              }
              className="text-sm opacity-40 hover:opacity-100"
              aria-label="Delete task"
            >
              Delete
            </button>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border px-2.5 py-1">
              {task.priority}
            </span>

            <span className="rounded-full border px-2.5 py-1">
              {task.status.replace(
                "_",
                " "
              )}
            </span>

            {task.project && (
              <span className="rounded-full border px-2.5 py-1">
                {task.project.name}
              </span>
            )}

            {task.goal && (
              <span className="rounded-full border px-2.5 py-1">
                Goal: {task.goal.title}
              </span>
            )}

            {task.recurrence && (
              <span className="rounded-full border px-2.5 py-1">
                ↻ {task.recurrence.frequency}
              </span>
            )}

            {task.reminders.length > 0 && (
              <span className="rounded-full border px-2.5 py-1">
                🔔 Reminder
              </span>
            )}
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div
              className={`mt-3 text-sm ${
                overdue
                  ? "font-medium"
                  : "opacity-60"
              }`}
            >
              {overdue
                ? "Overdue · "
                : "Due · "}
              {formatDueDate(task.dueDate)}
            </div>
          )}

          {/* Subtask count */}
          {task._count.subtasks > 0 && (
            <div className="mt-2 text-xs opacity-50">
              {task._count.subtasks}{" "}
              {task._count.subtasks === 1
                ? "subtask"
                : "subtasks"}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}