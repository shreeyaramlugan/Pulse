// lib/engines/schedulingEngine.ts

export type SchedulingTask = {
  id: string;
  title: string;
  estimatedMinutes: number | null;
  dueDate: Date | string | null;
  priorityScore: number;
  blocked: boolean;
};

export type ScheduledTask = {
  taskId: string;
  title: string;
  scheduledDate: string;
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
  reason: string;
};

export type SchedulingOptions = {
  workdayStartHour?: number;
  workdayEndHour?: number;

  /**
   * Percentage of the workday that Pulse is allowed
   * to intentionally schedule.
   *
   * 0.8 = 80% planned, 20% buffer.
   */
  utilizationTarget?: number;

  /**
   * Maximum amount of work Pulse should schedule
   * on a single calendar day.
   */
  capacityMinutes?: number;

  /**
   * Maximum number of days Pulse should search
   * when looking for a scheduling slot.
   */
  maxDays?: number;
};

type DaySchedule = {
  date: string;
  tasks: ScheduledTask[];
  usedMinutes: number;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Convert a Date into a local calendar date.
 *
 * IMPORTANT:
 * We intentionally do NOT use toISOString() here.
 *
 * toISOString() converts to UTC and can move a task
 * onto the previous/next calendar day depending on timezone.
 */
function toCalendarDate(date: Date): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

function parseDate(value: Date | string | null): Date | null {
  if (!value) return null;

  const date = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);

  result.setDate(result.getDate() + amount);

  return result;
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function getDuration(task: SchedulingTask): number {
  /**
   * Give tasks without an estimate a sensible default.
   */
  return Math.max(15, task.estimatedMinutes ?? 30);
}

function getDayCapacity(
  options: Required<SchedulingOptions>
): number {
  const workdayMinutes =
    (options.workdayEndHour - options.workdayStartHour) * 60;

  const targetCapacity = Math.floor(
    workdayMinutes * options.utilizationTarget
  );

  return Math.min(
    options.capacityMinutes,
    targetCapacity
  );
}

function getStartMinute(
  day: DaySchedule,
  options: Required<SchedulingOptions>
): number {
  if (day.tasks.length === 0) {
    return options.workdayStartHour * 60;
  }

  return Math.max(
    ...day.tasks.map((task) => task.endMinute)
  );
}

function createEmptyDay(date: Date): DaySchedule {
  return {
    date: toCalendarDate(date),
    tasks: [],
    usedMinutes: 0,
  };
}

function sortTasks(tasks: SchedulingTask[]) {
  return [...tasks].sort((a, b) => {
    // Highest intelligence score first.
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    // Earlier deadline first.
    const aDue = parseDate(a.dueDate);
    const bDue = parseDate(b.dueDate);

    if (aDue && bDue) {
      return aDue.getTime() - bDue.getTime();
    }

    if (aDue) return -1;
    if (bDue) return 1;

    return a.title.localeCompare(b.title);
  });
}

/**
 * Schedule tasks into unique calendar days.
 */
export function scheduleTasks(
  tasks: SchedulingTask[],
  existingSchedule: Map<string, ScheduledTask[]> = new Map(),
  options: SchedulingOptions = {}
): ScheduledTask[] {
  const resolvedOptions: Required<SchedulingOptions> = {
    workdayStartHour: options.workdayStartHour ?? 8,
    workdayEndHour: options.workdayEndHour ?? 17,
    utilizationTarget: options.utilizationTarget ?? 0.8,
    capacityMinutes:
      options.capacityMinutes ??
      (options.workdayEndHour ?? 17) -
        (options.workdayStartHour ?? 8) *
        60,
    maxDays: options.maxDays ?? 30,
  };

  const calculatedWorkdayMinutes =
    (resolvedOptions.workdayEndHour -
      resolvedOptions.workdayStartHour) *
    60;

  const dailyCapacity = Math.min(
    resolvedOptions.capacityMinutes ||
      calculatedWorkdayMinutes,
    getDayCapacity(resolvedOptions)
  );

  /**
   * Build a normalized map where the KEY is always YYYY-MM-DD.
   *
   * This is the important part that prevents:
   *
   * 2026-09-13T12:55:44.826Z
   * 2026-09-13T12:55:44.826Z
   *
   * from becoming separate "days".
   */
  const days = new Map<string, DaySchedule>();

  for (const [rawDate, scheduledTasks] of existingSchedule.entries()) {
    const parsed = parseDate(rawDate);

    if (!parsed) continue;

    const dateKey = toCalendarDate(parsed);

    const existingDay =
      days.get(dateKey) ?? createEmptyDay(parsed);

    existingDay.tasks.push(...scheduledTasks);

    existingDay.usedMinutes = existingDay.tasks.reduce(
      (total, task) => total + task.durationMinutes,
      0
    );

    days.set(dateKey, existingDay);
  }

  const now = new Date();

  const sortedTasks = sortTasks(
    tasks.filter(
      (task) =>
        task.status !== "COMPLETED" &&
        task.status !== "CANCELLED" &&
        !task.blocked
    )
  );

  const results: ScheduledTask[] = [];

  for (const task of sortedTasks) {
    const duration = getDuration(task);

    /**
     * Never schedule before today.
     */
    const today = startOfDay(now);

    /**
     * If the task has a deadline, start looking from today.
     * We then find the earliest available day.
     */
    let candidateDate = new Date(today);

    let scheduled = false;

    for (
      let dayOffset = 0;
      dayOffset < resolvedOptions.maxDays;
      dayOffset++
    ) {
      const currentDate = addDays(candidateDate, dayOffset);

      const dateKey = toCalendarDate(currentDate);

      let day = days.get(dateKey);

      if (!day) {
        day = createEmptyDay(currentDate);
        days.set(dateKey, day);
      }

      /**
       * Do not schedule after the task's deadline.
       *
       * We compare calendar dates, not timestamps.
       */
      const dueDate = parseDate(task.dueDate);

      if (dueDate) {
        const dueDay = startOfDay(dueDate);

        if (currentDate.getTime() > dueDay.getTime()) {
          break;
        }
      }

      /**
       * Check daily capacity.
       */
      if (
        day.usedMinutes + duration >
        dailyCapacity
      ) {
        continue;
      }

      const startMinute = getStartMinute(
        day,
        resolvedOptions
      );

      const endMinute = startMinute + duration;

      /**
       * Safety check against the actual workday.
       */
      const workdayEnd =
        resolvedOptions.workdayEndHour * 60;

      if (endMinute > workdayEnd) {
        continue;
      }

      let reason = "Scheduled based on available capacity.";

      if (task.priorityScore >= 75) {
        reason =
          "Scheduled early because this task has very high priority.";
      } else if (dueDate) {
        const dueDay = startOfDay(dueDate);

        const daysUntilDue = Math.ceil(
          (dueDay.getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue <= 1) {
          reason =
            "Scheduled early because the deadline is approaching.";
        } else if (daysUntilDue <= 3) {
          reason =
            "Scheduled soon because the deadline is within 3 days.";
        }
      }

      const scheduledTask: ScheduledTask = {
        taskId: task.id,
        title: task.title,
        scheduledDate: dateKey,
        startMinute,
        endMinute,
        durationMinutes: duration,
        reason,
      };

      day.tasks.push(scheduledTask);
      day.usedMinutes += duration;

      days.set(dateKey, day);

      results.push(scheduledTask);

      scheduled = true;

      break;
    }

    /**
     * If the task couldn't fit before its deadline,
     * schedule it on the first available future day.
     *
     * This prevents the intelligence system from simply
     * dropping tasks.
     */
    if (!scheduled) {
      for (
        let dayOffset = 0;
        dayOffset < resolvedOptions.maxDays;
        dayOffset++
      ) {
        const currentDate = addDays(
          today,
          dayOffset
        );

        const dateKey = toCalendarDate(currentDate);

        let day = days.get(dateKey);

        if (!day) {
          day = createEmptyDay(currentDate);
          days.set(dateKey, day);
        }

        if (
          day.usedMinutes + duration >
          dailyCapacity
        ) {
          continue;
        }

        const startMinute = getStartMinute(
          day,
          resolvedOptions
        );

        const endMinute = startMinute + duration;

        if (
          endMinute >
          resolvedOptions.workdayEndHour * 60
        ) {
          continue;
        }

        const scheduledTask: ScheduledTask = {
          taskId: task.id,
          title: task.title,
          scheduledDate: dateKey,
          startMinute,
          endMinute,
          durationMinutes: duration,
          reason:
            "Moved to the next available capacity window.",
        };

        day.tasks.push(scheduledTask);
        day.usedMinutes += duration;

        days.set(dateKey, day);

        results.push(scheduledTask);

        break;
      }
    }
  }

  /**
   * Final normalization.
   *
   * Guarantee:
   * - one calendar date per day
   * - no timestamp keys
   * - tasks ordered chronologically
   */
  return Array.from(days.values())
    .sort((a, b) =>
      a.date.localeCompare(b.date)
    )
    .flatMap((day) =>
      day.tasks.sort(
        (a, b) =>
          a.startMinute - b.startMinute
      )
    );
}