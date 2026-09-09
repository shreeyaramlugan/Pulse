import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be signed in to create a task.",
        },
        { status: 401 }
      );
    }

    // 2. Get request body
    const body = await request.json();

    const {
      title,
      description,
      priority,
      dueDate,
      estimatedMinutes,
      projectId,
      goalId,
      parentTaskId,

      // Repeat options
      repeat,

      // Reminder options
      reminder,
    } = body;

    // 3. Basic validation
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Task title is required.",
        },
        { status: 400 }
      );
    }

    // 4. Validate project ownership if provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: user.id,
        },
      });

      if (!project) {
        return NextResponse.json(
          {
            error: "InvalidProject",
            message: "Project not found or does not belong to you.",
          },
          { status: 400 }
        );
      }
    }

    // 5. Validate goal ownership if provided
    if (goalId) {
      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          userId: user.id,
        },
      });

      if (!goal) {
        return NextResponse.json(
          {
            error: "InvalidGoal",
            message: "Goal not found or does not belong to you.",
          },
          { status: 400 }
        );
      }
    }

    // 6. Validate parent task ownership if provided
    if (parentTaskId) {
      const parentTask = await prisma.task.findFirst({
        where: {
          id: parentTaskId,
          userId: user.id,
        },
      });

      if (!parentTask) {
        return NextResponse.json(
          {
            error: "InvalidParentTask",
            message: "Parent task not found or does not belong to you.",
          },
          { status: 400 }
        );
      }
    }

    // 7. Create task + optional recurrence + optional reminder
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          userId: user.id,

          title: title.trim(),

          description:
            description && typeof description === "string"
              ? description.trim()
              : null,

          priority: priority ?? "MEDIUM",

          dueDate: dueDate ? new Date(dueDate) : null,

          estimatedMinutes:
            estimatedMinutes !== undefined
              ? Number(estimatedMinutes)
              : null,

          projectId: projectId || null,
          goalId: goalId || null,
          parentTaskId: parentTaskId || null,
        },
      });

      // 8. Create recurrence if repeat was selected
      let recurrence = null;

      if (repeat?.enabled === true) {
        if (!repeat.frequency) {
          throw new Error(
            "Recurrence frequency is required when repeat is enabled."
          );
        }

        recurrence = await tx.taskRecurrence.create({
          data: {
            taskId: task.id,

            frequency: repeat.frequency,

            interval:
              repeat.interval !== undefined
                ? Number(repeat.interval)
                : 1,

            daysOfWeek: Array.isArray(repeat.daysOfWeek)
              ? repeat.daysOfWeek.map(Number)
              : [],

            startDate: repeat.startDate
              ? new Date(repeat.startDate)
              : new Date(),

            endDate: repeat.endDate
              ? new Date(repeat.endDate)
              : null,

            nextRunAt: repeat.nextRunAt
              ? new Date(repeat.nextRunAt)
              : null,
          },
        });
      }

      // 9. Create reminder if reminder was selected
      let createdReminder = null;

      if (reminder?.enabled === true) {
        if (!reminder.remindAt) {
          throw new Error(
            "Reminder date/time is required when reminder is enabled."
          );
        }

        createdReminder = await tx.reminder.create({
          data: {
            userId: user.id,

            taskId: task.id,

            title:
              reminder.title ||
              `Reminder: ${task.title}`,

            remindAt: new Date(reminder.remindAt),

            status: "PENDING",
          },
        });
      }

      // 10. Return everything created
      return {
        task,
        recurrence,
        reminder: createdReminder,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);

    return NextResponse.json(
      {
        error: "ServerError",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create task.",
      },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be signed in to view your tasks.",
        },
        { status: 401 }
      );
    }

    // 2. Read query parameters
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const goalId = searchParams.get("goalId");
    const parentTaskId = searchParams.get("parentTaskId");

const due = searchParams.get("due");

const dueBefore = searchParams.get("dueBefore");
const dueAfter = searchParams.get("dueAfter");

    const search = searchParams.get("search");

    const includeArchived =
      searchParams.get("includeArchived") === "true";

    // Pagination
    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") || 50),
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    // 3. Build filters
    const where: any = {
      userId: user.id,
    };

    // Don't show archived tasks unless explicitly requested
    if (!includeArchived && !status) {
      where.status = {
        not: "ARCHIVED",
      };
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

if (projectId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  });

  if (!project) {
    return Response.json(
      {
        message:
          "Project not found or does not belong to you.",
      },
      { status: 400 }
    );
  }
}

if (goalId) {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId: user.id,
    },
  });

  if (!goal) {
    return Response.json(
      {
        message:
          "Goal not found or does not belong to you.",
      },
      { status: 400 }
    );
  }
}

    if (parentTaskId) {
      where.parentTaskId = parentTaskId;
    }

    // 4. Due-date filters
// 4. Dynamic due-date filters
// 4. Dynamic due-date filters
const now = new Date();

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfNextDay(date: Date) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + 1);
  return result;
}

function startOfWeek(date: Date) {
  const result = startOfDay(date);

  // Monday = first day of week
  const day = result.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - daysFromMonday);

  return result;
}

function startOfNextWeek(date: Date) {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 7);

  return result;
}

function startOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
}

function startOfNextMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1,
    0,
    0,
    0,
    0
  );
}

if (due) {
  switch (due) {
    case "today": {
      const start = startOfDay(now);
      const end = startOfNextDay(now);

      where.dueDate = {
        gte: start,
        lt: end,
      };

      break;
    }

    case "tomorrow": {
      const start = startOfNextDay(now);
      const end = startOfNextDay(start);

      where.dueDate = {
        gte: start,
        lt: end,
      };

      break;
    }

    case "this-week": {
      const start = startOfWeek(now);
      const end = startOfNextWeek(now);

      where.dueDate = {
        gte: start,
        lt: end,
      };

      break;
    }

    case "this-month": {
      const start = startOfMonth(now);
      const end = startOfNextMonth(now);

      where.dueDate = {
        gte: start,
        lt: end,
      };

      break;
    }

    case "overdue": {
      const today = startOfDay(now);

      where.dueDate = {
        lt: today,
      };

      where.status = {
        notIn: [
          "COMPLETED",
          "CANCELLED",
          "ARCHIVED",
        ],
      };

      break;
    }
  }
}

    // 5. Search title/description
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // 6. Fetch tasks + total count
    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,

        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },

          goal: {
            select: {
              id: true,
              title: true,
              targetDate: true,
            },
          },

          recurrence: true,

          reminders: {
            where: {
              status: {
                not: "CANCELLED",
              },
            },

            orderBy: {
              remindAt: "asc",
            },
          },

          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
              completedAt: true,
            },

            orderBy: {
              createdAt: "asc",
            },
          },

          _count: {
            select: {
              subtasks: true,
            },
          },
        },

        orderBy: [
          {
            dueDate: "asc",
          },
          {
            priority: "desc",
          },
          {
            createdAt: "desc",
          },
        ],

        skip,
        take: limit,
      }),

      prisma.task.count({
        where,
      }),
    ]);

    // 7. Return results
    return NextResponse.json({
      success: true,

      data: tasks,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return NextResponse.json(
      {
        error: "ServerError",
        message: "Failed to retrieve tasks.",
      },
      { status: 500 }
    );
  }
}