"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type CreateTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type RepeatState = {
  enabled: boolean;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  daysOfWeek: number[];
  startDate: string;
  endDate: string;
};

type ReminderState = {
  enabled: boolean;
  remindAt: string;
};
type Project = {
  id: string;
  name: string;
  status: string;
};

type Goal = {
  id: string;
  title: string;
  targetDate: string | null;
};
const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function CreateTaskModal({
  open,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState("MEDIUM");

  const [dueDate, setDueDate] = useState("");

  const [estimatedMinutes, setEstimatedMinutes] =
    useState("");

  const [projectId, setProjectId] =
    useState("");

  const [goalId, setGoalId] =
    useState("");

  const [repeat, setRepeat] =
    useState<RepeatState>({
      enabled: false,
      frequency: "WEEKLY",
      interval: 1,
      daysOfWeek: [],
      startDate: "",
      endDate: "",
    });

  const [reminder, setReminder] =
    useState<ReminderState>({
      enabled: false,
      remindAt: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);
const [projects, setProjects] = useState<Project[]>([]);
const [goals, setGoals] = useState<Goal[]>([]);

const [loadingProjects, setLoadingProjects] =
  useState(false);

const [loadingGoals, setLoadingGoals] =
  useState(false);
useEffect(() => {
  if (!open) return;

  async function loadProjectsAndGoals() {
    try {
      setLoadingProjects(true);
      setLoadingGoals(true);
      setError(null);

      const [projectsResponse, goalsResponse] =
        await Promise.all([
          fetch("/api/projects", {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }),

          fetch("/api/goals", {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

      // Read responses safely
      const projectsText = await projectsResponse.text();
      const goalsText = await goalsResponse.text();

      let projectsData: any = {};
      let goalsData: any = {};

      try {
        projectsData = projectsText
          ? JSON.parse(projectsText)
          : {};
      } catch {
        throw new Error(
          `Projects API returned non-JSON response (${projectsResponse.status}).`
        );
      }

      try {
        goalsData = goalsText
          ? JSON.parse(goalsText)
          : {};
      } catch {
        throw new Error(
          `Goals API returned non-JSON response (${goalsResponse.status}).`
        );
      }

      if (!projectsResponse.ok) {
        throw new Error(
          projectsData.message ||
            "Failed to load projects."
        );
      }

      if (!goalsResponse.ok) {
        throw new Error(
          goalsData.message ||
            "Failed to load goals."
        );
      }

      setProjects(
        Array.isArray(projectsData.data)
          ? projectsData.data
          : []
      );

      setGoals(
        Array.isArray(goalsData.data)
          ? goalsData.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load projects/goals:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load projects and goals."
      );
    } finally {
      setLoadingProjects(false);
      setLoadingGoals(false);
    }
  }

  loadProjectsAndGoals();
}, [open]);
  if (!open) {
    return null;
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setEstimatedMinutes("");
    setProjectId("");
    setGoalId("");

    setRepeat({
      enabled: false,
      frequency: "WEEKLY",
      interval: 1,
      daysOfWeek: [],
      startDate: "",
      endDate: "",
    });

    setReminder({
      enabled: false,
      remindAt: "",
    });

    setError(null);
  }

  function handleClose() {
    if (loading) return;

    resetForm();
    onClose();
  }

  function toggleDay(day: number) {
    setRepeat((current) => {
      const exists =
        current.daysOfWeek.includes(day);

      return {
        ...current,

        daysOfWeek: exists
          ? current.daysOfWeek.filter(
              (item) => item !== day
            )
          : [...current.daysOfWeek, day].sort(
              (a, b) => a - b
            ),
      };
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (
      repeat.enabled &&
      repeat.frequency === "WEEKLY" &&
      repeat.daysOfWeek.length === 0
    ) {
      setError(
        "Select at least one day for a weekly task."
      );
      return;
    }

    if (
      reminder.enabled &&
      !reminder.remindAt
    ) {
      setError(
        "Please choose when you want to be reminded."
      );
      return;
    }

    try {
      setLoading(true);

      const payload: Record<string, unknown> = {
        title: title.trim(),

        description:
          description.trim() || null,

        priority,

        dueDate:
          dueDate || null,

        estimatedMinutes:
          estimatedMinutes
            ? Number(estimatedMinutes)
            : null,

        projectId:
          projectId || null,

        goalId:
          goalId || null,
      };

      // Only send recurrence when enabled
      if (repeat.enabled) {
        payload.repeat = {
          enabled: true,
          frequency: repeat.frequency,
          interval: Number(
            repeat.interval || 1
          ),

          daysOfWeek:
            repeat.frequency === "WEEKLY"
              ? repeat.daysOfWeek
              : [],

          startDate:
            repeat.startDate
              ? new Date(
                  repeat.startDate
                ).toISOString()
              : new Date().toISOString(),

          endDate:
            repeat.endDate
              ? new Date(
                  repeat.endDate
                ).toISOString()
              : null,
        };
      }

      // Only send reminder when enabled
      if (reminder.enabled) {
        payload.reminder = {
          enabled: true,

          remindAt: new Date(
            reminder.remindAt
          ).toISOString(),
        };
      }

      const response = await fetch(
        "/api/tasks",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create task."
        );
      }

      resetForm();

      onCreated();
      onClose();
    } catch (err) {
      console.error(
        "Create task error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">
              Create task
            </h2>

            <p className="mt-1 text-sm opacity-60">
              Add something you want to get done.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl opacity-50 transition hover:bg-black/5 hover:opacity-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="task-title"
                className="mb-2 block text-sm font-medium"
              >
                Task
              </label>

              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="What needs to be done?"
                autoFocus
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="task-description"
                className="mb-2 block text-sm font-medium"
              >
                Description
                <span className="ml-1 opacity-40">
                  Optional
                </span>
              </label>

              <textarea
                id="task-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Add some context..."
                rows={3}
                className="w-full resize-none rounded-xl border px-4 py-3 outline-none transition focus:ring-2"
              />
            </div>

            {/* Priority + Due date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-priority"
                  className="mb-2 block text-sm font-medium"
                >
                  Priority
                </label>

                <select
                  id="task-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border px-4 py-3"
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

              <div>
                <label
                  htmlFor="task-due-date"
                  className="mb-2 block text-sm font-medium"
                >
                  Due date
                </label>

                <input
                  id="task-due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
            </div>

            {/* Estimated time */}
            <div>
              <label
                htmlFor="estimated-time"
                className="mb-2 block text-sm font-medium"
              >
                Estimated time
                <span className="ml-1 opacity-40">
                  Optional
                </span>
              </label>

              <div className="relative">
                <input
                  id="estimated-time"
                  type="number"
                  min="1"
                  value={estimatedMinutes}
                  onChange={(event) =>
                    setEstimatedMinutes(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 60"
                  className="w-full rounded-xl border px-4 py-3 pr-20"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm opacity-50">
                  minutes
                </span>
              </div>
            </div>

          {/* Project + Goal */}
<div className="grid gap-4 sm:grid-cols-2">
  {/* Project */}
  <div>
    <label
      htmlFor="task-project"
      className="mb-2 block text-sm font-medium"
    >
      Project
      <span className="ml-1 opacity-40">
        Optional
      </span>
    </label>

    <select
      id="task-project"
      value={projectId}
      onChange={(event) =>
        setProjectId(event.target.value)
      }
      disabled={loadingProjects}
      className="w-full rounded-xl border px-4 py-3 bg-background"
    >
      <option value="">
        {loadingProjects
          ? "Loading projects..."
          : "Select a project"}
      </option>

      {projects.map((project) => (
        <option
          key={project.id}
          value={project.id}
        >
          {project.name}
        </option>
      ))}
    </select>

    {!loadingProjects &&
      projects.length === 0 && (
        <p className="mt-2 text-xs opacity-50">
          No projects yet.
        </p>
      )}
  </div>

  {/* Goal */}
  <div>
    <label
      htmlFor="task-goal"
      className="mb-2 block text-sm font-medium"
    >
      Goal
      <span className="ml-1 opacity-40">
        Optional
      </span>
    </label>

    <select
      id="task-goal"
      value={goalId}
      onChange={(event) =>
        setGoalId(event.target.value)
      }
      disabled={loadingGoals}
      className="w-full rounded-xl border px-4 py-3 bg-background"
    >
      <option value="">
        {loadingGoals
          ? "Loading goals..."
          : "Select a goal"}
      </option>

      {goals.map((goal) => (
        <option
          key={goal.id}
          value={goal.id}
        >
          {goal.title}
        </option>
      ))}
    </select>

    {!loadingGoals &&
      goals.length === 0 && (
        <p className="mt-2 text-xs opacity-50">
          No goals yet.
        </p>
      )}
  </div>
</div>

            {/* Repeat */}
            <section className="rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    Repeat task
                  </h3>

                  <p className="mt-1 text-sm opacity-60">
                    Automatically repeat this task.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={
                    repeat.enabled
                  }
                  onClick={() =>
                    setRepeat((current) => ({
                      ...current,
                      enabled:
                        !current.enabled,
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    repeat.enabled
                      ? "bg-current"
                      : "bg-black/15"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      repeat.enabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              {repeat.enabled && (
                <div className="mt-5 space-y-5">
                  {/* Frequency */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Repeat
                      </label>

                      <select
                        value={
                          repeat.frequency
                        }
                        onChange={(event) =>
                          setRepeat(
                            (current) => ({
                              ...current,
                              frequency:
                                event.target
                                  .value as RepeatState["frequency"],
                              daysOfWeek: [],
                            })
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3"
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

                        <option value="YEARLY">
                          Yearly
                        </option>
                      </select>
                    </div>

                    {/* Interval */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Every
                      </label>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={
                            repeat.interval
                          }
                          onChange={(event) =>
                            setRepeat(
                              (current) => ({
                                ...current,
                                interval:
                                  Number(
                                    event.target
                                      .value
                                  ),
                              })
                            )
                          }
                          className="w-full rounded-xl border px-4 py-3"
                        />

                        <span className="whitespace-nowrap text-sm opacity-60">
                          {repeat.frequency
                            .toLowerCase()
                            .replace(
                              "ly",
                              ""
                            )}
                          {repeat.interval ===
                          1
                            ? ""
                            : "s"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Days */}
                  {repeat.frequency ===
                    "WEEKLY" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Days
                      </label>

                      <div className="flex flex-wrap gap-2">
                        {DAYS.map((day) => {
                          const selected =
                            repeat.daysOfWeek.includes(
                              day.value
                            );

                          return (
                            <button
                              key={
                                day.value
                              }
                              type="button"
                              onClick={() =>
                                toggleDay(
                                  day.value
                                )
                              }
                              className={`h-10 min-w-10 rounded-xl border px-3 text-sm transition ${
                                selected
                                  ? "bg-current text-background"
                                  : ""
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Start + End */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Start date
                      </label>

                      <input
                        type="date"
                        value={
                          repeat.startDate
                        }
                        onChange={(event) =>
                          setRepeat(
                            (current) => ({
                              ...current,
                              startDate:
                                event.target
                                  .value,
                            })
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        End date
                        <span className="ml-1 opacity-40">
                          Optional
                        </span>
                      </label>

                      <input
                        type="date"
                        value={
                          repeat.endDate
                        }
                        onChange={(event) =>
                          setRepeat(
                            (current) => ({
                              ...current,
                              endDate:
                                event.target
                                  .value,
                            })
                          )
                        }
                        className="w-full rounded-xl border px-4 py-3"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Reminder */}
            <section className="rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    Reminder
                  </h3>

                  <p className="mt-1 text-sm opacity-60">
                    Get reminded before this task.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={
                    reminder.enabled
                  }
                  onClick={() =>
                    setReminder(
                      (current) => ({
                        ...current,
                        enabled:
                          !current.enabled,
                      })
                    )
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    reminder.enabled
                      ? "bg-current"
                      : "bg-black/15"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      reminder.enabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              {reminder.enabled && (
                <div className="mt-5">
                  <label
                    htmlFor="reminder-time"
                    className="mb-2 block text-sm font-medium"
                  >
                    Remind me at
                  </label>

                  <input
                    id="reminder-time"
                    type="datetime-local"
                    value={
                      reminder.remindAt
                    }
                    onChange={(event) =>
                      setReminder(
                        (current) => ({
                          ...current,
                          remindAt:
                            event.target.value,
                        })
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border px-5 py-2.5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl px-5 py-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}