// lib/engines/priorityEngine.ts

export type PriorityLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type SmartTask = {
  id: string;
  title: string;

  status:
    | "TODO"
    | "IN_PROGRESS"
    | "BLOCKED"
    | "COMPLETED"
    | "CANCELLED";

  priority: PriorityLevel;

  dueDate: Date | string | null;
  estimatedMinutes: number | null;

  project?: {
    id: string;
    name: string;

    status:
      | "PLANNING"
      | "ACTIVE"
      | "ON_HOLD"
      | "COMPLETED"
      | "CANCELLED"
      | "ARCHIVED";

    priority: PriorityLevel;

    startDate: Date | string | null;
    dueDate: Date | string | null;
  } | null;

  goal?: {
    id: string;
    title: string;

    status:
      | "ACTIVE"
      | "COMPLETED"
      | "PAUSED"
      | "CANCELLED"
      | "ARCHIVED";

    targetDate: Date | string | null;

    priority?: PriorityLevel | null;
  } | null;
};

export type PriorityResult = {
  taskId: string;
  score: number;
  level: PriorityLevel;

  factors: {
    taskPriority: number;
    taskDeadline: number;
    projectPriority: number;
    projectDeadline: number;
    goalImportance: number;
    goalDeadline: number;
    status: number;
    blocking: number;
  };

  reasons: string[];
};

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function daysUntil(
  date: Date | string | null
) {
  if (!date) return null;

  const target =
    new Date(date).getTime();

  const now = Date.now();

  return (
    (target - now) /
    (1000 * 60 * 60 * 24)
  );
}

function priorityScore(
  priority: PriorityLevel | null | undefined
) {
  switch (priority) {
    case "URGENT":
      return 25;

    case "HIGH":
      return 18;

    case "MEDIUM":
      return 10;

    case "LOW":
      return 4;

    default:
      return 5;
  }
}

function deadlineScore(
  date: Date | string | null
) {
  const days = daysUntil(date);

  if (days === null) return 0;

  if (days < 0) return 25;

  if (days <= 1) return 23;

  if (days <= 3) return 18;

  if (days <= 7) return 12;

  if (days <= 14) return 7;

  if (days <= 30) return 3;

  return 0;
}

export function calculatePriority(
  task: SmartTask,
  blockingCount = 0
): PriorityResult {
  const taskPriority =
    priorityScore(task.priority);

  const taskDeadline =
    deadlineScore(task.dueDate);

  const projectPriority =
    priorityScore(
      task.project?.priority
    );

  const projectDeadline =
    deadlineScore(
      task.project?.dueDate
    );

  const goalImportance =
    priorityScore(
      task.goal?.priority
    );

  const goalDeadline =
    deadlineScore(
      task.goal?.targetDate
    );

  let status = 0;

  if (task.status === "IN_PROGRESS") {
    status = 5;
  }

  if (task.status === "BLOCKED") {
    status = 2;
  }

  const blocking =
    Math.min(
      blockingCount * 2,
      10
    );

  const rawScore =
    taskPriority +
    taskDeadline +
    projectPriority +
    projectDeadline +
    goalImportance +
    goalDeadline +
    status +
    blocking;

  const score = clamp(
    rawScore
  );

  let level: PriorityLevel;

  if (score >= 75) {
    level = "URGENT";
  } else if (score >= 55) {
    level = "HIGH";
  } else if (score >= 30) {
    level = "MEDIUM";
  } else {
    level = "LOW";
  }

  const reasons: string[] = [];

  if (task.priority === "URGENT") {
    reasons.push(
      "Task is marked urgent."
    );
  }

  if (task.priority === "HIGH") {
    reasons.push(
      "Task has high priority."
    );
  }

  const taskDays =
    daysUntil(task.dueDate);

  if (
    taskDays !== null &&
    taskDays < 0
  ) {
    reasons.push(
      "Task is overdue."
    );
  } else if (
    taskDays !== null &&
    taskDays <= 3
  ) {
    reasons.push(
      "Task deadline is approaching."
    );
  }

  if (
    task.project?.priority ===
    "URGENT"
  ) {
    reasons.push(
      "Task belongs to an urgent project."
    );
  }

  if (
    task.project?.priority ===
    "HIGH"
  ) {
    reasons.push(
      "Task belongs to a high-priority project."
    );
  }

  if (task.goal) {
    reasons.push(
      `Task contributes to goal "${task.goal.title}".`
    );
  }

  if (
    task.goal?.targetDate &&
    (daysUntil(
      task.goal.targetDate
    ) ?? Infinity) <= 7
  ) {
    reasons.push(
      "The related goal is approaching its target date."
    );
  }

  if (blockingCount > 0) {
    reasons.push(
      `Task is blocking ${blockingCount} other task(s).`
    );
  }

  return {
    taskId: task.id,
    score,
    level,

    factors: {
      taskPriority,
      taskDeadline,
      projectPriority,
      projectDeadline,
      goalImportance,
      goalDeadline,
      status,
      blocking,
    },

    reasons,
  };
}