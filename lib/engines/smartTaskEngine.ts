// lib/engines/smartTaskEngine.ts

import {
  calculatePriority,
  PriorityResult,
  SmartTask,
} from "./priorityEngine";

import {
  analyseDependencies,
  getBlockingCount,
  DependencyTask,
} from "./dependencyEngine";

import {
  calculateWorkload,
  DailyWorkload,
} from "./workloadEngine";

import {
  scheduleTasks,
  ScheduledTask,
} from "./schedulingEngine";

export type SmartTaskResult = {
  task: SmartTask;

  priority: PriorityResult;

  dependency: {
    blocked: boolean;
    blockers: string[];
    dependents: string[];
    depth: number;
  };

  schedule: ScheduledTask | null;
parentTaskId: string | null;
  recommendations: string[];
};

export type SmartTaskEngineInput = {
  tasks: SmartTask[];

  capacityMinutesPerDay?: number;
};

export type SmartTaskEngineResult = {
  generatedAt: Date;

  tasks: SmartTaskResult[];

  workload: DailyWorkload[];

  summary: {
    totalTasks: number;

    actionableTasks: number;

    blockedTasks: number;

    overdueTasks: number;

    urgentTasks: number;

    highPriorityTasks: number;

    overloadedDays: number;
  };
  parentTaskId: string | null;
};


function isOverdue(
  date: Date | string | null
) {
  if (!date) return false;

  return (
    new Date(date).getTime() <
    Date.now()
  );
}

function generateRecommendations(
  task: SmartTask,
  priority: PriorityResult,
  dependency: {
    blocked: boolean;
    blockers: string[];
    dependents: string[];
  }
) {
  const recommendations: string[] =
    [];

  if (dependency.blocked) {
    recommendations.push(
      "Complete the blocking task before starting this task."
    );
  }

  if (
    dependency.dependents.length >
    0
  ) {
    recommendations.push(
      `Prioritise this task because it unlocks ${dependency.dependents.length} other task(s).`
    );
  }

  if (
    priority.score >= 75
  ) {
    recommendations.push(
      "This should be treated as one of your highest-priority tasks."
    );
  }

  if (
    priority.score >= 55 &&
    priority.score < 75
  ) {
    recommendations.push(
      "This task should be completed soon."
    );
  }

  if (
    isOverdue(task.dueDate)
  ) {
    recommendations.push(
      "This task is overdue and should be rescheduled or completed."
    );
  }

  if (
    task.project?.dueDate &&
    isOverdue(
      task.project.dueDate
    )
  ) {
    recommendations.push(
      "The parent project is overdue."
    );
  }

  if (
    task.goal?.targetDate &&
    isOverdue(
      task.goal.targetDate
    )
  ) {
    recommendations.push(
      "The related goal is past its target date."
    );
  }

  if (
    task.status === "BLOCKED"
  ) {
    recommendations.push(
      "Resolve the blocker before spending more time on this task."
    );
  }

  return recommendations;
}

export function runSmartTaskEngine({
  tasks,
  capacityMinutesPerDay = 8 * 60,
}: SmartTaskEngineInput): SmartTaskEngineResult {
  /*
   * -------------------------------------------------------
   * 1. Dependency analysis
   * -------------------------------------------------------
   */

const dependencyTasks: DependencyTask[] =
  tasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    parentTaskId: task.parentTaskId ?? null,
  }));

  const dependencies =
    analyseDependencies(
      dependencyTasks
    );

  const dependencyMap =
    new Map(
      dependencies.map(
        (dependency) => [
          dependency.taskId,
          dependency,
        ]
      )
    );

  /*
   * -------------------------------------------------------
   * 2. Priority analysis
   * -------------------------------------------------------
   */

  const priorityMap =
    new Map<
      string,
      PriorityResult
    >();

  for (const task of tasks) {
    const blockingCount =
      getBlockingCount(
        task.id,
        dependencyTasks
      );

    const result =
      calculatePriority(
        task,
        blockingCount
      );

    priorityMap.set(
      task.id,
      result
    );
  }

  /*
   * -------------------------------------------------------
   * 3. Workload
   * -------------------------------------------------------
   */

  const workload =
    calculateWorkload(
      tasks,
      capacityMinutesPerDay
    );

  /*
   * -------------------------------------------------------
   * 4. Scheduling
   * -------------------------------------------------------
   */

  const schedulingTasks =
    tasks
      .map((task) => {
        const dependency =
          dependencyMap.get(
            task.id
          );

        const priority =
          priorityMap.get(
            task.id
          );

        if (
          !priority ||
          !dependency
        ) {
          return null;
        }

        return {
          id: task.id,

          title: task.title,

          estimatedMinutes:
            task.estimatedMinutes,

          dueDate: task.dueDate,

          priorityScore:
            priority.score,

          blocked:
            dependency.blocked ||
            task.status ===
              "BLOCKED",
        };
      })
      .filter(
        (
          task
        ): task is NonNullable<
          typeof task
        > => task !== null
      );

  const scheduled =
    scheduleTasks(
      schedulingTasks,
      new Map(),
      {
        capacityMinutes:
          capacityMinutesPerDay,
      }
    );

  const scheduleMap =
    new Map(
      scheduled.map(
        (item) => [
          item.taskId,
          item,
        ]
      )
    );

  /*
   * -------------------------------------------------------
   * 5. Combine everything
   * -------------------------------------------------------
   */

  const results: SmartTaskResult[] =
    tasks.map((task) => {
      const priority =
        priorityMap.get(
          task.id
        )!;

      const dependency =
        dependencyMap.get(
          task.id
        )!;

      const schedule =
        scheduleMap.get(
          task.id
        ) ?? null;

      const recommendations =
        generateRecommendations(
          task,
          priority,
          dependency
        );

      return {
        task,

        priority,

        dependency: {
          blocked:
            dependency.blocked,

          blockers:
            dependency.blockers,

          dependents:
            dependency.dependents,

          depth:
            dependency.depth,
        },

        schedule,

        recommendations,
      };
    });

  /*
   * -------------------------------------------------------
   * 6. Summary
   * -------------------------------------------------------
   */

  const actionableTasks =
    tasks.filter(
      (task) =>
        task.status !==
          "COMPLETED" &&
        task.status !==
          "CANCELLED"
    );

  const blockedTasks =
    results.filter(
      (result) =>
        result.dependency.blocked ||
        result.task.status ===
          "BLOCKED"
    );

  const overdueTasks =
    tasks.filter((task) =>
      isOverdue(
        task.dueDate
      )
    );

  const urgentTasks =
    results.filter(
      (result) =>
        result.priority.level ===
        "URGENT"
    );

  const highPriorityTasks =
    results.filter(
      (result) =>
        result.priority.level ===
        "HIGH"
    );

  const overloadedDays =
    workload.filter(
      (day) =>
        day.overloaded
    );

  return {
    generatedAt:
      new Date(),

    tasks: results,

    workload,

    summary: {
      totalTasks:
        tasks.length,

      actionableTasks:
        actionableTasks.length,

      blockedTasks:
        blockedTasks.length,

      overdueTasks:
        overdueTasks.length,

      urgentTasks:
        urgentTasks.length,

      highPriorityTasks:
        highPriorityTasks.length,

      overloadedDays:
        overloadedDays.length,
    },
  };
}