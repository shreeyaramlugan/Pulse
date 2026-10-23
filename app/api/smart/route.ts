
import { NextResponse } from "next/server";

import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

import {
  runSmartTaskEngine,
} from "@/lib/engines/smartTaskEngine";

type SmartScheduleTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  projectId: string | null;
  projectName: string | null;
  goalId: string | null;
  goalName: string | null;
  score: number;
  reasons: string[];
  recommendedDate: string;
  recommendedTime: string;
};

function formatScheduleLabel(dateString: string) {
  const [year, month, day] =
    dateString.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const tomorrow = new Date(todayStart);

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  if (
    date.getTime() ===
    todayStart.getTime()
  ) {
    return "Today";
  }

  if (
    date.getTime() ===
    tomorrow.getTime()
  ) {
    return "Tomorrow";
  }

  return date.toLocaleDateString(
    "en-ZA",
    {
      weekday: "long",
      day: "numeric",
      month: "short",
    }
  );
}
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * --------------------------------------------------
     * Fetch Tasks
     * --------------------------------------------------
     */

    const tasks =
      await prisma.task.findMany({
        where: {
          userId: user.id,
        },

        include: {
          project: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    /*
     * --------------------------------------------------
     * Fetch Projects
     * --------------------------------------------------
     */

    const projects =
      await prisma.project.findMany({
        where: {
          userId: user.id,
        },

        include: {
          tasks: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    /*
     * --------------------------------------------------
     * Fetch Goals
     * --------------------------------------------------
     *
     * Your exact Goal schema may have slightly
     * different field names, so this section can
     * be adapted once we see your current schema.
     */

    const goals =
      await prisma.goal.findMany({
        where: {
          userId: user.id,
        },
      });

    /*
     * --------------------------------------------------
     * Build lookup maps
     * --------------------------------------------------
     */

    const projectMap =
      new Map(
        projects.map(
          (project) => [
            project.id,
            project,
          ]
        )
      );

    const goalMap =
      new Map(
        goals.map(
          (goal) => [
            goal.id,
            goal,
          ]
        )
      );

    /*
     * --------------------------------------------------
     * Adapt database tasks into intelligence tasks
     * --------------------------------------------------
     */

    const intelligenceTasks =
      tasks.map((task) => {
        const project =
          task.projectId
            ? projectMap.get(
                task.projectId
              )
            : null;

        const goal =
          "goalId" in task &&
          task.goalId
            ? goalMap.get(
                task.goalId
              )
            : null;

        return {
          id: task.id,

          title: task.title,

          description:
            task.description,

          status:
            task.status,

          priority:
            task.priority,

          dueDate:
            task.dueDate,

          estimatedMinutes:
            task.estimatedMinutes,

          parentTaskId:
            "parentTaskId" in task
              ? task.parentTaskId
              : null,

          project:
            project
              ? {
                  id: project.id,

                  name:
                    project.name,

                  status:
                    project.status,

                  priority:
                    project.priority,

                  startDate:
                    project.startDate,

                  dueDate:
                    project.dueDate,
                }
              : null,

          goal:
            goal
              ? {
                  id: goal.id,

                  title:
                    goal.title,

                  status:
                    goal.status,

                  targetDate:
                    "targetDate" in goal
                      ? goal.targetDate
                      : null,

                  priority:
                    "priority" in goal
                      ? goal.priority
                      : null,
                }
              : null,
        };
      });

    /*
     * --------------------------------------------------
     * Run intelligence engine
     * --------------------------------------------------
     */

    const intelligence =
      runSmartTaskEngine({
        tasks:
          intelligenceTasks as any,

        capacityMinutesPerDay:
          8 * 60,
      });

    /*
     * --------------------------------------------------
     * Transform intelligence into UI format
     * --------------------------------------------------
     */

    const priorityQueue =
      intelligence.tasks
        .filter(
          (item) =>
            item.task.status !==
              "COMPLETED" &&
            item.task.status !==
              "CANCELLED"
        )
        .sort(
          (a, b) =>
            b.priority.score -
            a.priority.score
        )
        .map((item) => ({
          id:
            item.task.id,

          title:
            item.task.title,

          description:
            item.task.description,

          status:
            item.task.status,

          priority:
            item.task.priority,

          dueDate:
            item.task.dueDate,

          projectId:
            item.task.project?.id ??
            null,

          projectName:
            item.task.project?.name ??
            null,

          goalId:
            item.task.goal?.id ??
            null,

          goalName:
            item.task.goal?.title ??
            null,

          score:
            item.priority.score,

          reasons:
            item.priority.reasons,

          blocked:
            item.dependency.blocked,

          overdue:
            item.task.dueDate
              ? new Date(
                  item.task.dueDate
                ).getTime() <
                Date.now()
              : false,

         recommendedDate:
  item.schedule?.scheduledDate
    ? String(item.schedule.scheduledDate)
    : null,

          recommendedTime:
            item.schedule
              ? `${Math.floor(
                  item.schedule
                    .startMinute / 60
                )
                  .toString()
                  .padStart(2, "0")}:${(
                  item.schedule
                    .startMinute % 60
                )
                  .toString()
                  .padStart(2, "0")}`
              : null,
        }));

    /*
     * --------------------------------------------------
     * Dependencies
     * --------------------------------------------------
     */

    const dependencies =
      intelligence.tasks.map(
        (item) => ({
          id:
            item.task.id,

          title:
            item.task.title,

          status:
            item.task.status,

          blocked:
            item.dependency.blocked,

          blockedBy:
            item.dependency.blockers
              .map((id) => {
                const blocker =
                  tasks.find(
                    (task) =>
                      task.id === id
                  );

                return (
                  blocker?.title ??
                  id
                );
              }),

          blocking:
            item.dependency.dependents
              .map((id) => {
                const dependent =
                  tasks.find(
                    (task) =>
                      task.id === id
                  );

                return (
                  dependent?.title ??
                  id
                );
              }),
        })
      );

    /*
     * --------------------------------------------------
     * Workload
     * --------------------------------------------------
     */

    const workload =
      intelligence.workload.map(
        (day) => ({
          date:
            day.date,

          label:
            new Date(
              day.date
            ).toLocaleDateString(
              "en-ZA",
              {
                weekday: "short",
              }
            ),

          minutes:
            day.scheduledMinutes,

          capacity:
            day.capacityMinutes,
        })
      );

    /*
     * --------------------------------------------------
     * Summary
     * --------------------------------------------------
     */

    const completedTasks =
      tasks.filter(
        (task) =>
          task.status ===
          "COMPLETED"
      ).length;

    const totalTasks =
      tasks.length;

    const completionRate =
      totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks /
              totalTasks) *
              100
          );

    const todayTasks =
      priorityQueue.filter(
        (task) => {
          if (!task.dueDate) {
            return false;
          }

          const due =
            new Date(
              task.dueDate
            );

          const today =
            new Date();

          return (
            due.getFullYear() ===
              today.getFullYear() &&
            due.getMonth() ===
              today.getMonth() &&
            due.getDate() ===
              today.getDate()
          );
        }
      ).length;

    const workloadScore =
      workload.length > 0
        ? Math.max(
            ...workload.map(
              (day) =>
                Math.round(
                  (day.minutes /
                    Math.max(
                      day.capacity,
                      1
                    )) *
                    100
                )
            )
          )
        : 0;

    /*
     * --------------------------------------------------
     * Reasoning
     * --------------------------------------------------
     */

    const reasoning =
      priorityQueue
        .slice(0, 8)
        .flatMap((task) =>
          task.reasons.map(
            (reason) => ({
              type:
                "PRIORITY" as const,

              title:
                task.title,

              explanation:
                reason,

              impact:
                task.score >= 75
                  ? ("HIGH" as const)
                  : task.score >= 50
                    ? ("MEDIUM" as const)
                    : ("LOW" as const),
            })
          )
        );

    /*
     * --------------------------------------------------
     * Response
     * --------------------------------------------------
     */

    return NextResponse.json({
      data: {
        summary: {
          totalTasks,

          overdueTasks:
            intelligence.summary
              .overdueTasks,

          urgentTasks:
            intelligence.summary
              .urgentTasks,

          blockedTasks:
            intelligence.summary
              .blockedTasks,

          todayTasks,

          workloadScore,

          completionRate,
        },

        priorityQueue,

        dependencies,

        workload,

        /*
         * Scheduling UI can consume the
         * scheduled task data directly.
         */

schedule: (() => {
  const grouped =
    new Map<
      string,
      SmartScheduleTask[]
    >();

  for (const item of intelligence.tasks) {
    if (!item.schedule) {
      continue;
    }

    const date =
      String(
        item.schedule.scheduledDate
      );

    const task: SmartScheduleTask = {
      id:
        item.task.id,

      title:
        item.task.title,

      description:
        item.task.description ?? null,

      status:
        item.task.status,

      priority:
        item.task.priority,

      dueDate:
        item.task.dueDate,

      projectId:
        item.task.project?.id ??
        null,

      projectName:
        item.task.project?.name ??
        null,

      goalId:
        item.task.goal?.id ??
        null,

      goalName:
        item.task.goal?.title ??
        null,

      score:
        item.priority.score,

      reasons:
        item.priority.reasons,

      recommendedDate:
        date,

      recommendedTime:
        `${Math.floor(
          item.schedule.startMinute / 60
        )
          .toString()
          .padStart(2, "0")}:${(
          item.schedule.startMinute % 60
        )
          .toString()
          .padStart(2, "0")}`,
    };

    const existing =
      grouped.get(date) ?? [];

    existing.push(task);

    grouped.set(
      date,
      existing
    );
  }

  return Array.from(
    grouped.entries()
  )
    .sort(
      ([dateA], [dateB]) =>
        dateA.localeCompare(dateB)
    )
    .map(
      ([date, tasks]) => ({
        date,

        label:
          formatScheduleLabel(date),

        tasks:
          tasks.sort(
            (a, b) =>
              a.recommendedTime.localeCompare(
                b.recommendedTime
              )
          ),
      })
    );
})(),

        reasoning,
      },
    });
  } catch (error) {
    console.error(
      "INTELLIGENCE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to analyse workspace.",
      },
      {
        status: 500,
      }
    );
  }
}