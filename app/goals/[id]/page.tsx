"use client";

import {
useCallback,
useEffect,
useMemo,
useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import GoalModal from "@/components/goals/goalModal";

type GoalStatus =
| "ACTIVE"
| "COMPLETED"
| "PAUSED"
| "CANCELLED"
| "ARCHIVED";

type GoalPriority =
| "LOW"
| "MEDIUM"
| "HIGH"
| "URGENT";

type GoalProgressType =
| "MANUAL"
| "METRIC"
| "SUBGOALS";

type Goal = {
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

status: GoalStatus;
priority: GoalPriority;

progressType: GoalProgressType;

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

subGoals: SubGoal[];

tasks: GoalTask[];

progressEntries: ProgressEntry[];

_count: {
subGoals: number;
tasks: number;
progressEntries: number;
};
};

type SubGoal = {
id: string;
title: string;
description: string | null;
status: GoalStatus;
priority: GoalPriority;
progressType: GoalProgressType;

targetDate: string | null;

currentValue: number | string | null;
targetValue: number | string | null;

_count?: {
subGoals: number;
tasks: number;
progressEntries: number;
};
};

type GoalTask = {
id: string;
title: string;
status: string;
priority: string;
dueDate: string | null;
completedAt: string | null;
};

type ProgressEntry = {
id: string;
value: number | string;
note: string | null;
recordedAt: string;
createdAt: string;
};

export default function GoalDetailPage() {
const params = useParams();

const goalId =
params.id as string;

const [goal, setGoal] =
useState<Goal | null>(null);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState<string | null>(null);

const [editOpen, setEditOpen] =
useState(false);

const [showSubGoals, setShowSubGoals] =
useState(true);

const [progressValue, setProgressValue] =
useState("");

const [progressNote, setProgressNote] =
useState("");

const [recordingProgress, setRecordingProgress] =
useState(false);

/*                                                                         |
| -------------------------------------------------------------------------- |
| Fetch goal                                                                 |
| -------------------------------------------------------------------------- |
*/


const fetchGoal =
useCallback(async () => {
try {
setLoading(true);
setError(null);

    const response =
      await fetch(
        `/api/goals/${goalId}`,
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
          "Failed to load goal."
      );
    }

    setGoal(data.data);
  } catch (err) {
    console.error(err);

    setError(
      err instanceof Error
        ? err.message
        : "Failed to load goal."
    );
  } finally {
    setLoading(false);
  }
}, [goalId]);


useEffect(() => {
if (goalId) {
fetchGoal();
}
}, [goalId, fetchGoal]);

/*                                                                         |
| -------------------------------------------------------------------------- |
| Progress calculation                                                       |
| -------------------------------------------------------------------------- |
*/


const progress = useMemo(() => {
if (!goal) return 0;

/*
|--------------------------------------------------------------------------
| Manual goal
|--------------------------------------------------------------------------
|
| Until manualProgress is added to the schema,
| manual goals are treated as 0 unless completed.
|
*/

if (
  goal.progressType ===
  "MANUAL"
) {
  return goal.status ===
    "COMPLETED"
    ? 100
    : 0;
}

/*
|--------------------------------------------------------------------------
| Sub-goal progress
|--------------------------------------------------------------------------
*/

if (
  goal.progressType ===
  "SUBGOALS"
) {
  if (
    goal.subGoals.length ===
    0
  ) {
    return 0;
  }

  const completed =
    goal.subGoals.filter(
      (subGoal) =>
        subGoal.status ===
        "COMPLETED"
    ).length;

  return Math.round(
    (completed /
      goal.subGoals.length) *
      100
  );
}

/*
|--------------------------------------------------------------------------
| Metric progress
|--------------------------------------------------------------------------
*/

if (
  goal.progressType ===
  "METRIC"
) {
  const start =
    Number(
      goal.startValue ?? 0
    );

  const current =
    Number(
      goal.currentValue ?? 0
    );

  const target =
    Number(
      goal.targetValue ?? 0
    );

  if (
    goal.metricDirection ===
    "DECREASE"
  ) {
    const total =
      start - target;

    const completed =
      start - current;

    if (total <= 0) {
      return 0;
    }

    return Math.min(
      Math.max(
        Math.round(
          (completed /
            total) *
            100
        ),
        0
      ),
      100
    );
  }

  const total =
    target - start;

  const completed =
    current - start;

  if (total <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(
      Math.round(
        (completed /
          total) *
          100
      ),
      0
    ),
    100
  );
}

return 0;

}, [goal]);

/*                                                                         |
| -------------------------------------------------------------------------- |
| Record progress                                                            |
| -------------------------------------------------------------------------- |
*/

async function recordProgress() {
if (!progressValue.trim()) {
setError(
"Enter a progress value."
);


  return;
}

const value =
  Number(progressValue);

if (!Number.isFinite(value)) {
  setError(
    "Progress must be a valid number."
  );

  return;
}

try {
  setRecordingProgress(true);
  setError(null);

  const response =
    await fetch(
      `/api/goals/${goalId}/progress`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          value,
          note:
            progressNote.trim() ||
            null,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to record progress."
    );
  }

  setProgressValue("");
  setProgressNote("");

  await fetchGoal();
} catch (err) {
  console.error(err);

  setError(
    err instanceof Error
      ? err.message
      : "Failed to record progress."
  );
} finally {
  setRecordingProgress(false);
}


}

/*                                                                         |
| -------------------------------------------------------------------------- |
| Toggle completed                                                           |
| -------------------------------------------------------------------------- |
*/


async function toggleCompleted() {
if (!goal) return;

try {
  setError(null);

  const status =
    goal.status ===
    "COMPLETED"
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
          status,
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

  setGoal(
    (current) =>
      current
        ? {
            ...current,
            ...data.data,
          }
        : current
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

/*                                                                         |
| -------------------------------------------------------------------------- |
| Delete                                                                     |
| -------------------------------------------------------------------------- |
*/


async function deleteGoal() {
if (!goal) return;


const confirmed =
  window.confirm(
    "Are you sure you want to delete this goal?"
  );

if (!confirmed) return;

try {
  const response =
    await fetch(
      `/api/goals/${goal.id}`,
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

  window.location.href =
    "/goals";
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
| Formatting helpers                                                         |
| -------------------------------------------------------------------------- |
*/


function formatDate(
date: string | null
) {
if (!date) return "No date";


return new Date(
  date
).toLocaleDateString(
  "en-ZA",
  {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
);


}

function formatNumber(
value:
| number
| string
| null
) {
if (
value === null ||
value === undefined
) {
return "—";
}


return Number(value).toLocaleString(
  "en-ZA"
);


}

function getStatusLabel(
status: GoalStatus
) {
return status
.replace("_", " ")
.toLowerCase()
.replace(
/\b\w/g,
(char) =>
char.toUpperCase()
);
}

function getPriorityLabel(
priority: GoalPriority
) {
return (
priority.charAt(0) +
priority
.slice(1)
.toLowerCase()
);
}
/*                                                                         |
| -------------------------------------------------------------------------- |
| Loading                                                                    |
| -------------------------------------------------------------------------- |
*/


if (loading) {
return ( <main className="min-h-screen px-6 py-8"> <div className="mx-auto max-w-7xl"> <div className="animate-pulse"> <div className="mb-6 h-4 w-24 rounded bg-current opacity-10" />

```
        <div className="mb-3 h-10 w-80 rounded bg-current opacity-10" />

        <div className="h-5 w-96 rounded bg-current opacity-10" />
      </div>
    </div>
  </main>
);


}

/*                                                                         |
| -------------------------------------------------------------------------- |
| Error / missing goal                                                       |
| -------------------------------------------------------------------------- |
*/


if (error && !goal) {
return ( <main className="min-h-screen px-6 py-8"> <div className="mx-auto max-w-7xl"> <Link
         href="/goals"
         className="text-sm opacity-60 hover:opacity-100"
       >
← Back to Goals </Link>
      <div className="mt-8 rounded-2xl border p-6">
        <h1 className="text-xl font-semibold">
          Unable to load goal
        </h1>

        <p className="mt-2 text-sm opacity-60">
          {error}
        </p>
      </div>
    </div>
  </main>
);


}

if (!goal) {
return null;
}

/*                                                                         |
| -------------------------------------------------------------------------- |
| Render                                                                     |
| -------------------------------------------------------------------------- |
*/


return ( <main className="min-h-screen px-6 py-8"> <div className="mx-auto max-w-7xl">


    {/* Back */}
    <div className="mb-6">
      <Link
        href="/goals"
        className="text-sm opacity-60 transition hover:opacity-100"
      >
        ← Back to Goals
      </Link>
    </div>

    {/* Error */}
    {error && (
      <div className="mb-6 rounded-xl border border-red-300 p-4 text-sm">
        {error}
      </div>
    )}

    {/* Header */}
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border px-3 py-1 text-xs font-medium">
            {getStatusLabel(
              goal.status
            )}
          </span>

          <span className="rounded-full border px-3 py-1 text-xs opacity-70">
            {getPriorityLabel(
              goal.priority
            )}
          </span>

          <span className="rounded-full border px-3 py-1 text-xs opacity-70">
            {goal.period}
          </span>
        </div>

        <h1 className="text-3xl font-bold">
          {goal.title}
        </h1>

        {goal.description && (
          <p className="mt-3 max-w-2xl opacity-60">
            {goal.description}
          </p>
        )}

        {goal.parentGoal && (
          <p className="mt-3 text-sm opacity-50">
            Part of{" "}
            <Link
              href={`/goals/${goal.parentGoal.id}`}
              className="underline underline-offset-4"
            >
              {goal.parentGoal.title}
            </Link>
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={
            toggleCompleted
          }
          className="rounded-xl border px-4 py-2 text-sm font-medium"
        >
          {goal.status ===
          "COMPLETED"
            ? "Mark Active"
            : "Mark Complete"}
        </button>

        <button
          type="button"
          onClick={() =>
            setEditOpen(true)
          }
          className="rounded-xl border px-4 py-2 text-sm font-medium"
        >
          Edit Goal
        </button>

        <button
          type="button"
          onClick={deleteGoal}
          className="rounded-xl border px-4 py-2 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>

    {/* Main grid */}
    <div className="grid gap-6 lg:grid-cols-3">

      {/* Progress */}
      <section className="rounded-2xl border p-6 lg:col-span-2">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-60">
              Progress
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              {progress}%
            </h2>
          </div>

          <span className="text-sm opacity-50">
            {goal.progressType}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-3 overflow-hidden rounded-full bg-current opacity-10">
          <div
            className="h-full rounded-full bg-current transition-all"
            style={{
              width: `${progress}%`,
              opacity: 1,
            }}
          />
        </div>

        {/* Metric information */}
        {goal.progressType ===
          "METRIC" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-50">
                Start
              </p>

              <p className="mt-1 font-semibold">
                {formatNumber(
                  goal.startValue
                )}{" "}
                {goal.unit || ""}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider opacity-50">
                Current
              </p>

              <p className="mt-1 font-semibold">
                {formatNumber(
                  goal.currentValue
                )}{" "}
                {goal.unit || ""}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider opacity-50">
                Target
              </p>

              <p className="mt-1 font-semibold">
                {formatNumber(
                  goal.targetValue
                )}{" "}
                {goal.unit || ""}
              </p>
            </div>
          </div>
        )}

        {/* Sub-goal summary */}
        {goal.progressType ===
          "SUBGOALS" && (
          <p className="text-sm opacity-60">
            {
              goal.subGoals.filter(
                (item) =>
                  item.status ===
                  "COMPLETED"
              ).length
            }{" "}
            of{" "}
            {
              goal.subGoals.length
            }{" "}
            sub-goals completed.
          </p>
        )}

        {/* Manual */}
        {goal.progressType ===
          "MANUAL" && (
          <p className="text-sm opacity-60">
            Mark this goal complete
            when you've achieved it.
          </p>
        )}
      </section>

      {/* Details */}
      <section className="rounded-2xl border p-6">
        <p className="text-sm opacity-60">
          Goal details
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-50">
              Period
            </p>

            <p className="mt-1 font-medium">
              {goal.period}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider opacity-50">
              Start date
            </p>

            <p className="mt-1 font-medium">
              {formatDate(
                goal.startDate
              )}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider opacity-50">
              Target date
            </p>

            <p className="mt-1 font-medium">
              {formatDate(
                goal.targetDate
              )}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider opacity-50">
              Tasks
            </p>

            <p className="mt-1 font-medium">
              {goal._count.tasks}
            </p>
          </div>
        </div>
      </section>

      {/* Record progress */}
      {goal.progressType ===
        "METRIC" && (
        <section className="rounded-2xl border p-6 lg:col-span-2">
          <div className="mb-5">
            <p className="text-sm opacity-60">
              Update progress
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Record a new value
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto]">
            <input
              type="number"
              value={
                progressValue
              }
              onChange={(event) =>
                setProgressValue(
                  event.target
                    .value
                )
              }
              placeholder={
                goal.unit ||
                "Value"
              }
              className="rounded-xl border bg-transparent px-4 py-3 outline-none"
            />

            <input
              type="text"
              value={
                progressNote
              }
              onChange={(event) =>
                setProgressNote(
                  event.target
                    .value
                )
              }
              placeholder="Add a note (optional)"
              className="rounded-xl border bg-transparent px-4 py-3 outline-none"
            />

            <button
              type="button"
              onClick={
                recordProgress
              }
              disabled={
                recordingProgress
              }
              className="rounded-xl px-5 py-3 font-medium disabled:opacity-50"
            >
              {recordingProgress
                ? "Saving..."
                : "Record"}
            </button>
          </div>
        </section>
      )}

      {/* Progress history */}
      {goal.progressEntries.length >
        0 && (
        <section className="rounded-2xl border p-6 lg:col-span-3">
          <div className="mb-5">
            <p className="text-sm opacity-60">
              History
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Progress history
            </h2>
          </div>

          <div className="divide-y">
            {goal.progressEntries.map(
              (entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {formatNumber(
                        entry.value
                      )}{" "}
                      {goal.unit ||
                        ""}
                    </p>

                    {entry.note && (
                      <p className="mt-1 text-sm opacity-60">
                        {
                          entry.note
                        }
                      </p>
                    )}
                  </div>

                  <p className="text-sm opacity-50">
                    {formatDate(
                      entry.recordedAt
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Sub-goals */}
      <section className="rounded-2xl border p-6 lg:col-span-3">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-60">
              Goal breakdown
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Sub-goals
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setShowSubGoals(
                  (current) =>
                    !current
                )
              }
              className="rounded-xl border px-4 py-2 text-sm"
            >
              {showSubGoals
                ? "Hide"
                : "Show"}{" "}
              sub-goals
            </button>
          </div>
        </div>

        {showSubGoals && (
          <>
            {goal.subGoals
              .length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <p className="font-medium">
                  No sub-goals yet
                </p>

                <p className="mt-1 text-sm opacity-50">
                  Break this goal into
                  smaller milestones.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {goal.subGoals.map(
                  (subGoal) => (
                    <Link
                      key={
                        subGoal.id
                      }
                      href={`/goals/${subGoal.id}`}
                      className="rounded-xl border p-4 transition hover:opacity-80"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium">
                            {
                              subGoal.title
                            }
                          </h3>

                          {subGoal.description && (
                            <p className="mt-1 text-sm opacity-50">
                              {
                                subGoal.description
                              }
                            </p>
                          )}
                        </div>

                        <span className="rounded-full border px-2 py-1 text-xs">
                          {getStatusLabel(
                            subGoal.status
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs opacity-50">
                        <span>
                          {
                            subGoal.priority
                          }
                        </span>

                        <span>
                          {subGoal.targetDate
                            ? formatDate(
                                subGoal.targetDate
                              )
                            : "No deadline"}
                        </span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Tasks */}
      <section className="rounded-2xl border p-6 lg:col-span-3">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-60">
              Execution
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Linked tasks
            </h2>
          </div>

          <span className="text-sm opacity-50">
            {goal.tasks.length}{" "}
            {goal.tasks.length ===
            1
              ? "task"
              : "tasks"}
          </span>
        </div>

        {goal.tasks.length ===
        0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">
              No tasks linked
            </p>

            <p className="mt-1 text-sm opacity-50">
              Tasks connected to this
              goal will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {goal.tasks.map(
              (task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p
                      className={
                        task.status ===
                        "COMPLETED"
                          ? "font-medium line-through opacity-50"
                          : "font-medium"
                      }
                    >
                      {task.title}
                    </p>

                    <p className="mt-1 text-xs opacity-50">
                      {task.priority}
                      {task.dueDate
                        ? ` • Due ${formatDate(
                            task.dueDate
                          )}`
                        : ""}
                    </p>
                  </div>

                  <span className="text-xs opacity-50">
                    {task.status}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  </div>

  {/* Edit Goal Modal */}
  <GoalModal
    open={editOpen}
    goal={goal}
    onClose={() =>
      setEditOpen(false)
    }
    onCreated={() => {
      setEditOpen(false);
      fetchGoal();
    }}
    onUpdated={() => {
      setEditOpen(false);
      fetchGoal();
    }}
  />
</main>

);
}
