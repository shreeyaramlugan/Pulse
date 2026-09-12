import {
  GoalMetricDirection,
  GoalMetricType,
  GoalPeriod,
  GoalPriority,
  GoalProgressType,
  GoalStatus,
} from "@/app/generated/prisma/enums";

export function calculateGoalProgress(goal: {
  status: GoalStatus;
  progressType: GoalProgressType;

  startValue?: number | null;
  currentValue?: number | null;
  targetValue?: number | null;

  metricDirection?: GoalMetricDirection | null;

  subGoals?: {
    status: GoalStatus;
  }[];
}) {
  if (goal.status === GoalStatus.COMPLETED) {
    return 100;
  }

  if (goal.progressType === GoalProgressType.SUBGOALS) {
    const subGoals = goal.subGoals ?? [];

    if (subGoals.length === 0) {
      return 0;
    }

    const completed = subGoals.filter(
      (subGoal) => subGoal.status === GoalStatus.COMPLETED
    ).length;

    return Math.round(
      (completed / subGoals.length) * 100
    );
  }

  if (
    goal.progressType === GoalProgressType.METRIC &&
    goal.currentValue !== null &&
    goal.currentValue !== undefined &&
    goal.targetValue !== null &&
    goal.targetValue !== undefined
  ) {
    const start = goal.startValue ?? 0;
    const current = goal.currentValue;
    const target = goal.targetValue;

    if (start === target) {
      return 100;
    }

    if (
      goal.metricDirection ===
      GoalMetricDirection.DECREASE
    ) {
      const progress =
        ((start - current) / (start - target)) * 100;

      return Math.min(
        100,
        Math.max(0, Math.round(progress))
      );
    }

    const progress =
      ((current - start) / (target - start)) * 100;

    return Math.min(
      100,
      Math.max(0, Math.round(progress))
    );
  }

  return 0;
}