import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be signed in to delete a task.",
        },
        { status: 401 }
      );
    }

    // 2. Get task ID
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Task ID is required.",
        },
        { status: 400 }
      );
    }

    // 3. Find task belonging to current user
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          error: "NotFound",
          message: "Task not found.",
        },
        { status: 404 }
      );
    }

    // 4. Delete task
    // TaskRecurrence and Reminder will cascade-delete
    // because of your Prisma onDelete: Cascade relations.
    await prisma.task.delete({
      where: {
        id: task.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return NextResponse.json(
      {
        error: "ServerError",
        message: "Failed to delete task.",
      },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be signed in to update a task.",
        },
        { status: 401 }
      );
    }

    // 2. Get task ID
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Task ID is required.",
        },
        { status: 400 }
      );
    }

    // 3. Make sure task belongs to current user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },

      include: {
        recurrence: true,
        reminders: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        {
          error: "NotFound",
          message: "Task not found.",
        },
        { status: 404 }
      );
    }

    // 4. Read body
    const body = await request.json();

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedMinutes,
      actualMinutes,
      projectId,
      goalId,
      parentTaskId,

      // Recurrence
      repeat,

      // Reminder
      reminder,
    } = body;

    // --------------------------------------------------
    // 5. Validate related records
    // --------------------------------------------------

    if (projectId !== undefined && projectId !== null) {
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
            message:
              "Project not found or does not belong to you.",
          },
          { status: 400 }
        );
      }
    }

    if (goalId !== undefined && goalId !== null) {
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
            message:
              "Goal not found or does not belong to you.",
          },
          { status: 400 }
        );
      }
    }

    if (
      parentTaskId !== undefined &&
      parentTaskId !== null
    ) {
      // Prevent task from becoming its own parent
      if (parentTaskId === id) {
        return NextResponse.json(
          {
            error: "InvalidParentTask",
            message: "A task cannot be its own parent.",
          },
          { status: 400 }
        );
      }

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
            message:
              "Parent task not found or does not belong to you.",
          },
          { status: 400 }
        );
      }
    }

    // --------------------------------------------------
    // 6. Build task update
    // --------------------------------------------------

    const taskData: any = {};

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        title.trim().length === 0
      ) {
        return NextResponse.json(
          {
            error: "ValidationError",
            message: "Task title cannot be empty.",
          },
          { status: 400 }
        );
      }

      taskData.title = title.trim();
    }

    if (description !== undefined) {
      taskData.description =
        description === null
          ? null
          : String(description).trim();
    }

    if (status !== undefined) {
      taskData.status = status;

      // Automatically manage completedAt
      if (status === "COMPLETED") {
        taskData.completedAt =
          existingTask.completedAt ?? new Date();
      } else if (
        existingTask.status === "COMPLETED"
      ) {
        taskData.completedAt = null;
      }
    }

    if (priority !== undefined) {
      taskData.priority = priority;
    }

    if (dueDate !== undefined) {
      taskData.dueDate =
        dueDate === null
          ? null
          : new Date(dueDate);
    }

    if (estimatedMinutes !== undefined) {
      taskData.estimatedMinutes =
        estimatedMinutes === null
          ? null
          : Number(estimatedMinutes);
    }

    if (actualMinutes !== undefined) {
      taskData.actualMinutes =
        actualMinutes === null
          ? null
          : Number(actualMinutes);
    }

    if (projectId !== undefined) {
      taskData.projectId = projectId;
    }

    if (goalId !== undefined) {
      taskData.goalId = goalId;
    }

    if (parentTaskId !== undefined) {
      taskData.parentTaskId = parentTaskId;
    }

    // --------------------------------------------------
    // 7. Transaction
    // --------------------------------------------------

    const result = await prisma.$transaction(
      async (tx) => {
        // Update task
        const task = await tx.task.update({
          where: {
            id: existingTask.id,
          },

          data: taskData,
        });

        // ------------------------------------------------
        // 8. Handle recurrence
        // ------------------------------------------------

        let recurrence = existingTask.recurrence;

        if (repeat !== undefined) {
          // Remove recurrence
          if (repeat === null || repeat.enabled === false) {
            if (existingTask.recurrence) {
              await tx.taskRecurrence.delete({
                where: {
                  taskId: task.id,
                },
              });
            }

            recurrence = null;
          }

          // Create/update recurrence
          else if (repeat.enabled === true) {
            if (!repeat.frequency) {
              throw new Error(
                "Recurrence frequency is required."
              );
            }

            const recurrenceData = {
              frequency: repeat.frequency,

              interval:
                repeat.interval !== undefined
                  ? Number(repeat.interval)
                  : 1,

              daysOfWeek:
                Array.isArray(repeat.daysOfWeek)
                  ? repeat.daysOfWeek.map(Number)
                  : [],

              startDate: repeat.startDate
                ? new Date(repeat.startDate)
                : existingTask.recurrence?.startDate ??
                  new Date(),

              endDate: repeat.endDate
                ? new Date(repeat.endDate)
                : null,

              nextRunAt: repeat.nextRunAt
                ? new Date(repeat.nextRunAt)
                : null,
            };

            recurrence =
              await tx.taskRecurrence.upsert({
                where: {
                  taskId: task.id,
                },

                update: recurrenceData,

                create: {
                  taskId: task.id,
                  ...recurrenceData,
                },
              });
          }
        }

        // ------------------------------------------------
        // 9. Handle reminder
        // ------------------------------------------------

        let createdReminder =
          existingTask.reminders.find(
            (r) => r.status !== "CANCELLED"
          ) ?? null;

        if (reminder !== undefined) {
          // Remove/cancel reminder
          if (
            reminder === null ||
            reminder.enabled === false
          ) {
            if (createdReminder) {
              await tx.reminder.update({
                where: {
                  id: createdReminder.id,
                },

                data: {
                  status: "CANCELLED",
                },
              });

              createdReminder = null;
            }
          }

          // Create/update reminder
          else if (reminder.enabled === true) {
            if (!reminder.remindAt) {
              throw new Error(
                "Reminder date/time is required."
              );
            }

            if (createdReminder) {
              createdReminder =
                await tx.reminder.update({
                  where: {
                    id: createdReminder.id,
                  },

                  data: {
                    title:
                      reminder.title ||
                      `Reminder: ${task.title}`,

                    remindAt: new Date(
                      reminder.remindAt
                    ),

                    status: "PENDING",
                  },
                });
            } else {
              createdReminder =
                await tx.reminder.create({
                  data: {
                    userId: user.id,

                    taskId: task.id,

                    title:
                      reminder.title ||
                      `Reminder: ${task.title}`,

                    remindAt: new Date(
                      reminder.remindAt
                    ),

                    status: "PENDING",
                  },
                });
            }
          }
        }

        // ------------------------------------------------
        // 10. Return updated task
        // ------------------------------------------------

        const updatedTask =
          await tx.task.findUnique({
            where: {
              id: task.id,
            },

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
          });

        return updatedTask;
      }
    );

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return NextResponse.json(
      {
        error: "ServerError",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update task.",
      },
      { status: 500 }
    );
  }
}