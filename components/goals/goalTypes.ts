/** Lightweight sub-goal summary embedded in a Goal. */
export type SubGoal = {
  id: string;
  title: string;
  description: string | null;
  status:
    | "ACTIVE"
    | "COMPLETED"
    | "PAUSED"
    | "CANCELLED"
    | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  targetDate: string | null;
  parentGoalId?: string | null;
};

export type Goal = {
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

status:
| "ACTIVE"
| "COMPLETED"
| "PAUSED"
| "CANCELLED"
| "ARCHIVED";

priority:
| "LOW"
| "MEDIUM"
| "HIGH"
| "URGENT";

progressType:
| "MANUAL"
| "METRIC"
| "SUBGOALS";

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
_count: {
subGoals: number;
tasks: number;
progressEntries: number;
};
};

export type GoalFilters = {
status: string;
priority: string;
period: string;
progressType: string;
};
