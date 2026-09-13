// app/api/projects/[id]/steps/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  Prisma,
  TaskPriority,
  TaskStatus,
} from "@/app/generated/prisma/enums";

import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Verify project ownership
|--------------------------------------------------------------------------
*/

async function getOwnedProject(
  projectId: string,
  userId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });
}

/*
|--------------------------------------------------------------------------
| GET /api/projects/[id]/steps
|--------------------------------------------------------------------------
*/

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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
    const { id: projectId } =
      await context.params;

    const project =
      await getOwnedProject(
        projectId,
        user.id
      );

    if (!project) {
      return NextResponse.json(
        {
          message:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    const steps =
      await prisma.task.findMany({
        where: {
          projectId,
          userId: user.id,
        },

        orderBy: [
          {
            status: "asc",
          },
          {
            dueDate: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

    const completed =
      steps.filter(
        (step) =>
          step.status ===
          TaskStatus.COMPLETED
      ).length;

    return NextResponse.json({
      data: steps,

      progress: {
        total: steps.length,
        completed,
        percentage:
          steps.length === 0
            ? 0
            : Math.round(
                (completed /
                  steps.length) *
                  100
              ),
      },
    });
  } catch (error) {
    console.error(
      "GET project steps error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load project steps.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/projects/[id]/steps
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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
    const { id: projectId } =
      await context.params;

    const project =
      await getOwnedProject(
        projectId,
        user.id
      );

    if (!project) {
      return NextResponse.json(
        {
          message:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedMinutes,
    } = body;

    /*
    |--------------------------------------------------------------------------
    | Validate title
    |--------------------------------------------------------------------------
    */

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Step title is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate status
    |--------------------------------------------------------------------------
    */

    if (
      status &&
      !Object.values(
        TaskStatus
      ).includes(status)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid step status.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate priority
    |--------------------------------------------------------------------------
    */

    if (
      priority &&
      !Object.values(
        TaskPriority
      ).includes(priority)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid step priority.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create task
    |--------------------------------------------------------------------------
    */

    const step =
      await prisma.task.create({
        data: {
          userId: user.id,

          projectId,

          title: title.trim(),

          description:
            typeof description ===
            "string"
              ? description.trim() ||
                null
              : null,

          status:
            status ||
            TaskStatus.TODO,

          priority:
            priority ||
            TaskPriority.MEDIUM,

          dueDate: dueDate
            ? new Date(dueDate)
            : null,

          estimatedMinutes:
            estimatedMinutes !==
              undefined &&
            estimatedMinutes !== null
              ? Number(
                  estimatedMinutes
                )
              : null,

          completedAt:
            status ===
            TaskStatus.COMPLETED
              ? new Date()
              : null,
        },
      });

    return NextResponse.json(
      {
        data: step,

        message:
          "Project step created successfully.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST project step error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create project step.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/projects/[id]/steps?stepId=...
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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

    const { id: projectId } =
      await context.params;

    const { searchParams } =
      new URL(request.url);

    const stepId =
      searchParams.get("stepId");

    if (!stepId) {
      return NextResponse.json(
        {
          message:
            "stepId is required.",
        },
        {
          status: 400,
        }
      );
    }

    const project =
      await getOwnedProject(
        projectId,
        user.id
      );

    if (!project) {
      return NextResponse.json(
        {
          message:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    const existing =
      await prisma.task.findFirst({
        where: {
          id: stepId,
          projectId,
          userId: user.id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          message:
            "Project step not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body =
      await request.json();

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedMinutes,
      actualMinutes,
    } = body;

    /*
    |--------------------------------------------------------------------------
    | Validate
    |--------------------------------------------------------------------------
    */

    if (
      status !== undefined &&
      !Object.values(
        TaskStatus
      ).includes(status)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid step status.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      priority !== undefined &&
      !Object.values(
        TaskPriority
      ).includes(priority)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid step priority.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Build update
    |--------------------------------------------------------------------------
    */

    const updateData: Prisma.TaskUpdateInput =
      {};

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim()
      ) {
        return NextResponse.json(
          {
            message:
              "Step title cannot be empty.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.title =
        title.trim();
    }

    if (description !== undefined) {
      updateData.description =
        typeof description ===
        "string"
          ? description.trim() ||
            null
          : null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (priority !== undefined) {
      updateData.priority =
        priority;
    }

    if (dueDate !== undefined) {
      updateData.dueDate =
        dueDate
          ? new Date(dueDate)
          : null;
    }

    if (
      estimatedMinutes !==
      undefined
    ) {
      updateData.estimatedMinutes =
        estimatedMinutes ===
          null ||
        estimatedMinutes === ""
          ? null
          : Number(
              estimatedMinutes
            );
    }

    if (
      actualMinutes !==
      undefined
    ) {
      updateData.actualMinutes =
        actualMinutes === null ||
        actualMinutes === ""
          ? null
          : Number(
              actualMinutes
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Completion timestamp
    |--------------------------------------------------------------------------
    */

    if (
      status ===
      TaskStatus.COMPLETED
    ) {
      updateData.completedAt =
        new Date();
    }

    if (
      status !== undefined &&
      status !==
        TaskStatus.COMPLETED &&
      existing.status ===
        TaskStatus.COMPLETED
    ) {
      updateData.completedAt =
        null;
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    const step =
      await prisma.task.update({
        where: {
          id: stepId,
        },

        data: updateData,
      });

    return NextResponse.json({
      data: step,

      message:
        "Project step updated successfully.",
    });
  } catch (error) {
    console.error(
      "PATCH project step error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update project step.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE /api/projects/[id]/steps?stepId=...
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
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

    const { id: projectId } =
      await context.params;

    const { searchParams } =
      new URL(request.url);

    const stepId =
      searchParams.get("stepId");

    if (!stepId) {
      return NextResponse.json(
        {
          message:
            "stepId is required.",
        },
        {
          status: 400,
        }
      );
    }

    const project =
      await getOwnedProject(
        projectId,
        user.id
      );

    if (!project) {
      return NextResponse.json(
        {
          message:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    const step =
      await prisma.task.findFirst({
        where: {
          id: stepId,
          projectId,
          userId: user.id,
        },
      });

    if (!step) {
      return NextResponse.json(
        {
          message:
            "Project step not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.task.delete({
      where: {
        id: stepId,
      },
    });

    return NextResponse.json({
      message:
        "Project step deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE project step error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete project step.",
      },
      {
        status: 500,
      }
    );
  }
}