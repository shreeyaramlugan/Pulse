"use client";

import { useState } from "react";
import type { Goal } from "./goalPage";

type Props = {
  goal: Goal;

  onToggle: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onEdit: (goal: Goal) => void;

  onAddSubGoal: (goal: Goal) => void;
  onToggleSubGoal: (goal: Goal) => void;
  onEditSubGoal: (goal: Goal) => void;
};


function getProgress(goal: Goal | null) {
  if (!goal) return 0;

  if (
    goal.progressType === "METRIC" &&
    goal.currentValue !== null &&
    goal.targetValue !== null &&
    Number(goal.targetValue) !== 0
  ) {
    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (Number(goal.currentValue) /
            Number(goal.targetValue)) *
            100
        )
      )
    );
  }

  if (goal.progressType === "SUBGOALS") {
    const subGoals = goal.subGoals ?? [];

    if (subGoals.length === 0) {
      return 0;
    }

    const completed = subGoals.filter(
      (subGoal) => subGoal.status === "COMPLETED"
    ).length;

    return Math.round(
      (completed / subGoals.length) * 100
    );
  }

  return goal.status === "COMPLETED" ? 100 : 0;
}

export default function GoalCard({
  goal,
  onToggle,
  onDelete,
  onEdit,
  onAddSubGoal,
  onToggleSubGoal,
  onEditSubGoal,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  /*
   * A null goal can occur while the create/edit modal
   * is changing state. Do not attempt to render it.
   */
  if (!goal) {
    return null;
  }

  const progress = getProgress(goal);

  const subGoalCount =
    goal._count?.subGoals ??
    goal.subGoals?.length ??
    0;

  return (
    <div className="overflow-hidden rounded-2xl border">
      {/* Main goal */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {goal.status === "COMPLETED"
                  ? "✓"
                  : "○"}
              </span>

              <h2 className="text-xl font-semibold">
                {goal.title}
              </h2>
            </div>

            {goal.description && (
              <p className="mt-2 opacity-60">
                {goal.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Edit
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>

            <span>
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full border">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-wide opacity-60">
          <span>{goal.period}</span>

          <span>•</span>

          <span>{goal.priority}</span>

          {goal.targetDate && (
            <>
              <span>•</span>

              <span>
                Due{" "}
                {new Date(
                  goal.targetDate
                ).toLocaleDateString()}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {subGoalCount > 0 && (
            <button
              type="button"
              onClick={() =>
                setExpanded(
                  (current) => !current
                )
              }
              className="rounded-lg border px-3 py-2 text-sm"
            >
              {expanded
                ? "Hide sub-goals"
                : `Show ${subGoalCount} sub-goal${
                    subGoalCount === 1
                      ? ""
                      : "s"
                  }`}
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onAddSubGoal(goal)
            }
            className="rounded-lg border px-3 py-2 text-sm"
          >
            + Sub-goal
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(goal.id)
            }
            className="ml-auto rounded-lg border px-3 py-2 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Sub-goals */}
      {expanded && (
        <div className="border-t p-4">
{goal.subGoals?.length > 0 && (
  <div className="mt-5 border-t pt-4">
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold">
          Sub-goals
        </p>

        <p className="text-xs opacity-50">
          {goal.subGoals.filter(
            (subGoal) =>
              subGoal.status === "COMPLETED"
          ).length}{" "}
          of {goal.subGoals.length} completed
        </p>
      </div>
    </div>

    <div className="space-y-2">
      {goal.subGoals.map((subGoal) => {
        const completed =
          subGoal.status === "COMPLETED";

        return (
          <div
            key={subGoal.id}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            {/* Complete */}
            <button
              type="button"
              onClick={() =>
                onToggleSubGoal(subGoal)
              }
              aria-label={
                completed
                  ? "Mark sub-goal as active"
                  : "Mark sub-goal as complete"
              }
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                completed
                  ? "text-sm"
                  : ""
              }`}
            >
              {completed && "✓"}
            </button>

            {/* Title */}
            <button
              type="button"
              onClick={() =>
                onEditSubGoal(subGoal)
              }
              className={`min-w-0 flex-1 text-left text-sm ${
                completed
                  ? "line-through opacity-50"
                  : ""
              }`}
            >
              {subGoal.title}
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() =>
                onEditSubGoal(subGoal)
              }
              className="rounded-lg border px-2.5 py-1.5 text-xs opacity-70 transition hover:opacity-100"
            >
              Edit
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}
      </div>
      )}
    </div>
  );
}

