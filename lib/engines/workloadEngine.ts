// lib/engines/workloadEngine.ts

export type WorkloadTask = {
  id: string;
  title: string;

  status:
    | "TODO"
    | "IN_PROGRESS"
    | "BLOCKED"
    | "COMPLETED"
    | "CANCELLED";

  estimatedMinutes: number | null;

  dueDate: Date | string | null;
};

export type DailyWorkload = {
  date: string;

  scheduledMinutes: number;

  capacityMinutes: number;

  percentage: number;

  overloaded: boolean;

  taskIds: string[];
};

function dateKey(
  date: Date
) {
  return date
    .toISOString()
    .slice(0, 10);
}

export function calculateWorkload(
  tasks: WorkloadTask[],
  capacityMinutes = 8 * 60
): DailyWorkload[] {
  const map =
    new Map<
      string,
      DailyWorkload
    >();

  for (const task of tasks) {
    if (
      task.status === "COMPLETED" ||
      task.status === "CANCELLED" ||
      !task.dueDate
    ) {
      continue;
    }

    const date =
      dateKey(
        new Date(task.dueDate)
      );

    const existing =
      map.get(date) ?? {
        date,

        scheduledMinutes: 0,

        capacityMinutes,

        percentage: 0,

        overloaded: false,

        taskIds: [],
      };

    existing.scheduledMinutes +=
      task.estimatedMinutes ?? 30;

    existing.taskIds.push(
      task.id
    );

    existing.percentage =
      Math.round(
        (existing.scheduledMinutes /
          capacityMinutes) *
          100
      );

    existing.overloaded =
      existing.scheduledMinutes >
      capacityMinutes;

    map.set(
      date,
      existing
    );
  }

  return Array.from(
    map.values()
  ).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export function getWorkloadScore(
  scheduledMinutes: number,
  capacityMinutes: number
) {
  if (capacityMinutes <= 0) {
    return 100;
  }

  return Math.min(
    Math.round(
      (scheduledMinutes /
        capacityMinutes) *
        100
    ),
    200
  );
}

export function findNextAvailableDate(
  startDate: Date,
  durationMinutes: number,
  existingWorkload: Map<
    string,
    number
  >,
  capacityMinutes = 8 * 60
) {
  const date =
    new Date(startDate);

  for (let i = 0; i < 60; i++) {
    const key =
      dateKey(date);

    const used =
      existingWorkload.get(
        key
      ) ?? 0;

    if (
      used + durationMinutes <=
      capacityMinutes
    ) {
      return new Date(date);
    }

    date.setDate(
      date.getDate() + 1
    );
  }

  return null;
}