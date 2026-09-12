"use client";

import { useEffect, useState } from "react";
import type { Goal } from "./goalPage";

type Props = {
  open: boolean;
  goal: Goal | null;
  parentGoal: Goal | null;
  onClose: () => void;
  onCreated: () => void;
  onUpdated: () => void;
};
type GoalModalProps = {
  open: boolean;
  onClose: () => void;

  goal: Goal | null;

  parentGoal?: Goal | null;

  onCreated: () => void;
  onUpdated: () => void;
};

type GoalPeriod =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "ANNUAL";

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

type GoalMetricType =
  | "NUMBER"
  | "CURRENCY"
  | "PERCENTAGE"
  | "HOURS"
  | "MINUTES"
  | "CUSTOM";

type GoalMetricDirection =
  | "INCREASE"
  | "DECREASE";

export default function GoalModal({
  open,
  onClose,
  goal,
  parentGoal,
  onCreated,
  onUpdated,
}: GoalModalProps) {
  const isEditing = Boolean(goal);
  const isSubGoal = Boolean(parentGoal);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [period, setPeriod] =
    useState<GoalPeriod>("MONTHLY");

  const [status, setStatus] =
    useState<GoalStatus>("ACTIVE");

  const [priority, setPriority] =
    useState<GoalPriority>("MEDIUM");

  const [progressType, setProgressType] =
    useState<GoalProgressType>("MANUAL");

  const [metricType, setMetricType] =
    useState<GoalMetricType>("NUMBER");

  const [metricName, setMetricName] =
    useState("");

  const [unit, setUnit] = useState("");

  const [metricDirection, setMetricDirection] =
    useState<GoalMetricDirection>("INCREASE");

  const [startValue, setStartValue] =
    useState("");

  const [currentValue, setCurrentValue] =
    useState("");

  const [targetValue, setTargetValue] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [targetDate, setTargetDate] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Populate the form when editing.
   * Reset it when creating a new goal.
   */
  useEffect(() => {
    if (!open) return;

    setError(null);

    if (goal) {
      setTitle(goal.title);
      setDescription(
        goal.description ?? ""
      );

      setPeriod(
        goal.period as GoalPeriod
      );

      setStatus(
        goal.status as GoalStatus
      );

      setPriority(
        goal.priority as GoalPriority
      );

      setProgressType(
        goal.progressType as GoalProgressType
      );

      setMetricType(
        (goal.metricType ??
          "NUMBER") as GoalMetricType
      );

      setMetricName(
        goal.metricName ?? ""
      );

      setUnit(goal.unit ?? "");

      setMetricDirection(
        (goal.metricDirection ??
          "INCREASE") as GoalMetricDirection
      );

      setStartValue(
        goal.startValue !== null &&
        goal.startValue !== undefined
          ? String(goal.startValue)
          : ""
      );

      setCurrentValue(
        goal.currentValue !== null &&
        goal.currentValue !== undefined
          ? String(goal.currentValue)
          : ""
      );

      setTargetValue(
        goal.targetValue !== null &&
        goal.targetValue !== undefined
          ? String(goal.targetValue)
          : ""
      );

      setStartDate(
        goal.startDate
          ? formatDateForInput(
              goal.startDate
            )
          : ""
      );

      setTargetDate(
        goal.targetDate
          ? formatDateForInput(
              goal.targetDate
            )
          : ""
      );
    } else {
      resetForm();
    }
  }, [open, goal]);

  function resetForm() {
    setTitle("");
    setDescription("");

    setPeriod("MONTHLY");
    setStatus("ACTIVE");
    setPriority("MEDIUM");

    setProgressType(
      isSubGoal
        ? "MANUAL"
        : "MANUAL"
    );

    setMetricType("NUMBER");
    setMetricName("");
    setUnit("");

    setMetricDirection("INCREASE");

    setStartValue("");
    setCurrentValue("");
    setTargetValue("");

    setStartDate("");
    setTargetDate("");
  }

  function formatDateForInput(
    value: string | Date
  ) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date
      .toISOString()
      .split("T")[0];
  }

  function validate() {
    if (!title.trim()) {
      return "Please enter a goal title.";
    }

    if (
      progressType === "METRIC" &&
      !targetValue.trim()
    ) {
      return "Please enter a target value.";
    }

    if (
      progressType === "METRIC" &&
      targetValue.trim() &&
      Number(targetValue) === 0
    ) {
      return "Target value cannot be zero.";
    }

    return null;
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError(null);

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload: Record<
        string,
        unknown
      > = {
        title: title.trim(),
        description:
          description.trim() || null,

        period,
        status,
        priority,

        progressType,

        startDate:
          startDate || null,

        targetDate:
          targetDate || null,
      };

      /*
       * Only send metric configuration
       * when the goal uses metric progress.
       */
      if (
        progressType === "METRIC"
      ) {
        payload.metricType =
          metricType;

        payload.metricName =
          metricName.trim() || null;

        payload.unit =
          unit.trim() || null;

        payload.metricDirection =
          metricDirection;

        payload.startValue =
          startValue.trim()
            ? Number(startValue)
            : null;

        payload.currentValue =
          currentValue.trim()
            ? Number(currentValue)
            : null;

        payload.targetValue =
          targetValue.trim()
            ? Number(targetValue)
            : null;
      } else {
        payload.metricType = null;
        payload.metricName = null;
        payload.unit = null;
        payload.startValue = null;
        payload.currentValue = null;
        payload.targetValue = null;
      }

      /*
       * Creating a sub-goal.
       */
      if (
        !isEditing &&
        parentGoal
      ) {
        payload.parentGoalId =
          parentGoal.id;
      }

      const url = isEditing
        ? `/api/goals/${goal!.id}`
        : "/api/goals";

      const method = isEditing
        ? "PATCH"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${
              isEditing
                ? "update"
                : "create"
            } goal.`
        );
      }

      /*
       * Tell the parent page to refresh.
       */
      if (isEditing) {
        onUpdated();
      } else {
        onCreated();
      }

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b p-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider opacity-50">
              {isSubGoal
                ? "Sub-goal"
                : "Productivity"}
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              {isEditing
                ? "Edit Goal"
                : isSubGoal
                ? "Create Sub-goal"
                : "Create Goal"}
            </h2>

            {parentGoal && (
              <p className="mt-2 text-sm opacity-60">
                Part of:{" "}
                <span className="font-medium">
                  {parentGoal.title}
                </span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm"
            disabled={saving}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-300 p-4 text-sm">
              {error}
            </div>
          )}

          {/* Basic information */}
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
              Goal details
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Goal title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Build my portfolio"
                  className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="What do you want to achieve?"
                  rows={3}
                  className="w-full resize-none rounded-xl border bg-transparent px-4 py-3 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Classification */}
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
              Classification
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Period */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Period
                </label>

                <select
                  value={period}
                  onChange={(event) =>
                    setPeriod(
                      event.target
                        .value as GoalPeriod
                    )
                  }
                  className="w-full rounded-xl border bg-transparent px-4 py-3"
                >
                  <option value="DAILY">
                    Daily
                  </option>

                  <option value="WEEKLY">
                    Weekly
                  </option>

                  <option value="MONTHLY">
                    Monthly
                  </option>

                  <option value="QUARTERLY">
                    Quarterly
                  </option>

                  <option value="ANNUAL">
                    Annual
                  </option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as GoalPriority
                    )
                  }
                  className="w-full rounded-xl border bg-transparent px-4 py-3"
                >
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
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as GoalStatus
                    )
                  }
                  className="w-full rounded-xl border bg-transparent px-4 py-3"
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="PAUSED">
                    Paused
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
              </div>
            </div>
          </section>

          {/* Progress */}
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
              Progress tracking
            </h3>

            <div className="space-y-4">
              {/* Progress type */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Progress type
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      [
                        "MANUAL",
                        "Manual",
                        "Mark progress yourself.",
                      ],
                      [
                        "METRIC",
                        "Metric",
                        "Track a measurable value.",
                      ],
                      [
                        "SUBGOALS",
                        "Sub-goals",
                        "Progress comes from sub-goals.",
                      ],
                    ] as const
                  ).map(
                    ([
                      value,
                      label,
                      description,
                    ]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setProgressType(
                            value
                          )
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          progressType ===
                          value
                            ? "ring-2"
                            : ""
                        }`}
                      >
                        <p className="font-medium">
                          {label}
                        </p>

                        <p className="mt-1 text-xs opacity-60">
                          {description}
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Metric configuration */}
              {progressType ===
                "METRIC" && (
                <div className="space-y-4 rounded-xl border p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Metric type */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Metric type
                      </label>

                      <select
                        value={
                          metricType
                        }
                        onChange={(
                          event
                        ) =>
                          setMetricType(
                            event.target
                              .value as GoalMetricType
                          )
                        }
                        className="w-full rounded-xl border bg-transparent px-4 py-3"
                      >
                        <option value="NUMBER">
                          Number
                        </option>

                        <option value="CURRENCY">
                          Currency
                        </option>

                        <option value="PERCENTAGE">
                          Percentage
                        </option>

                        <option value="HOURS">
                          Hours
                        </option>

                        <option value="MINUTES">
                          Minutes
                        </option>

                        <option value="CUSTOM">
                          Custom
                        </option>
                      </select>
                    </div>

                    {/* Direction */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Direction
                      </label>

                      <select
                        value={
                          metricDirection
                        }
                        onChange={(
                          event
                        ) =>
                          setMetricDirection(
                            event.target
                              .value as GoalMetricDirection
                          )
                        }
                        className="w-full rounded-xl border bg-transparent px-4 py-3"
                      >
                        <option value="INCREASE">
                          Increase
                        </option>

                        <option value="DECREASE">
                          Decrease
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Metric name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Metric name
                      </label>

                      <input
                        type="text"
                        value={
                          metricName
                        }
                        onChange={(
                          event
                        ) =>
                          setMetricName(
                            event.target
                              .value
                          )
                        }
                        placeholder="e.g. Projects completed"
                        className="w-full rounded-xl border bg-transparent px-4 py-3"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Unit
                      </label>

                      <input
                        type="text"
                        value={unit}
                        onChange={(
                          event
                        ) =>
                          setUnit(
                            event.target
                              .value
                          )
                        }
                        placeholder="e.g. projects, hours, R"
                        className="w-full rounded-xl border bg-transparent px-4 py-3"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Start */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Start value
                      </label>

                      <input
                        type="number"
                        value={
                          startValue
                        }
                        onChange={(
                          event
                        ) =>
                          setStartValue(
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border bg-transparent px-4 py-3"
                      />
                    </div>

                    {/* Current */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Current value
                      </label>

                      <input
                        type="number"
                        value={
                          currentValue
                        }
                        onChange={(
                          event
                        ) =>
                          setCurrentValue(
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border bg-transparent px-4 py-3"
                      />
                    </div>

                    {/* Target */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Target value
                      </label>

                      <input
                        type="number"
                        value={
                          targetValue
                        }
                        onChange={(
                          event
                        ) =>
                          setTargetValue(
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border bg-transparent px-4 py-3"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Dates */}
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
              Timeline
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Start date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border bg-transparent px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target date
                </label>

                <input
                  type="date"
                  value={targetDate}
                  onChange={(event) =>
                    setTargetDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border bg-transparent px-4 py-3"
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border px-5 py-3 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !title.trim()
              }
              className="rounded-xl px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : isSubGoal
                ? "Create Sub-goal"
                : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
