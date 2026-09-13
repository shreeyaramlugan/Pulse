// app/api/projects/[id]/route.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  Prisma,
  ProjectPriority,
  ProjectStatus,
} from "@/app/generated/prisma/enums";

import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

async function getAuthenticatedUserId() {
  /*
   * Replace with your existing authentication helper.
   */

  return null as string | null;
}

/*
|--------------------------------------------------------------------------
| GET /api/projects/[id]
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
    { message: "Unauthorized." },
    { status: 401 }
  );
}

    const { id } =
      await context.params;

    const project =
      await prisma.project.findFirst({
        where: {
          id,
          userId: user.id,
        },

        include: {
          tasks: {
            orderBy: {
              createdAt: "asc",
            },

            select: {
              id: true,
              title: true,
              description: true,

              status: true,
              priority: true,

              dueDate: true,

              estimatedMinutes: true,
              actualMinutes: true,

              completedAt: true,

              createdAt: true,
              updatedAt: true,
            },
          },

          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

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

    const total =
      project.tasks.length;

    const completed =
      project.tasks.filter(
        (task) =>
          task.status ===
          "COMPLETED"
      ).length;

    const percentage =
      total === 0
        ? 0
        : Math.round(
            (completed / total) *
              100
          );

    return NextResponse.json({
      data: {
        ...project,

        steps: project.tasks,

        progress: {
          total,
          completed,
          percentage,
        },
      },
    });
  } catch (error) {
    console.error(
      "GET /api/projects/[id] error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load project.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/projects/[id]
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
    { message: "Unauthorized." },
    { status: 401 }
  );
}

    const { id } =
      await context.params;

    const existing =
      await prisma.project.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

    if (!existing) {
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
      name,
      description,
      clientId,
      status,
      priority,
      startDate,
      dueDate,
    } = body;

    /*
    |--------------------------------------------------------------------------
    | Validate status
    |--------------------------------------------------------------------------
    */

    if (
      status !== undefined &&
      !Object.values(
        ProjectStatus
      ).includes(status)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid project status.",
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
      priority !== undefined &&
      !Object.values(
        ProjectPriority
      ).includes(priority)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid project priority.",
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

    const updateData: Prisma.ProjectUpdateInput =
      {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return NextResponse.json(
          {
            message:
              "Project name cannot be empty.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.name =
        name.trim();
    }

    if (description !== undefined) {
      updateData.description =
        typeof description ===
        "string"
          ? description.trim() ||
            null
          : null;
    }

    if (clientId !== undefined) {
      updateData.clientId =
        clientId || null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (priority !== undefined) {
      updateData.priority =
        priority;
    }

    if (startDate !== undefined) {
      updateData.startDate =
        startDate
          ? new Date(startDate)
          : null;
    }

    if (dueDate !== undefined) {
      updateData.dueDate =
        dueDate
          ? new Date(dueDate)
          : null;
    }

    /*
    |--------------------------------------------------------------------------
    | Automatically handle lifecycle dates
    |--------------------------------------------------------------------------
    */

    if (
      status ===
      ProjectStatus.ACTIVE &&
      !existing.startDate
    ) {
      updateData.startDate =
        new Date();
    }

    if (
      status ===
      ProjectStatus.COMPLETED
    ) {
      updateData.completedAt =
        new Date();
    }

    if (
      status !==
        ProjectStatus.COMPLETED &&
      existing.status ===
        ProjectStatus.COMPLETED
    ) {
      updateData.completedAt =
        null;
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    const project =
      await prisma.project.update({
        where: {
          id,
        },

        data: updateData,

        include: {
          tasks: {
            orderBy: {
              createdAt: "asc",
            },
          },

          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

    const total =
      project.tasks.length;

    const completed =
      project.tasks.filter(
        (task) =>
          task.status ===
          "COMPLETED"
      ).length;

    const percentage =
      total === 0
        ? 0
        : Math.round(
            (completed / total) *
              100
          );

    return NextResponse.json({
      data: {
        ...project,

        steps: project.tasks,

        progress: {
          total,
          completed,
          percentage,
        },
      },

      message:
        "Project updated successfully.",
    });
  } catch (error) {
    console.error(
      "PATCH /api/projects/[id] error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update project.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE /api/projects/[id]
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
    const userId =
      await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    const project =
      await prisma.project.findFirst({
        where: {
          id,
          userId,
        },
      });

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

    /*
    |--------------------------------------------------------------------------
    | Important
    |--------------------------------------------------------------------------
    |
    | Task.projectId uses onDelete: SetNull,
    | so deleting the project does NOT delete
    | the tasks.
    |
    */

    await prisma.project.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message:
        "Project deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/projects/[id] error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete project.",
      },
      {
        status: 500,
      }
    );
  }
}