// app/api/projects/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  ProjectPriority,
  ProjectStatus,
  Prisma,
} from "@/app/generated/prisma/enums";
import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
|
| Replace this function with the same authentication helper used by your
| existing Tasks / Goals API if your project already has one.
|
*/
/*
|--------------------------------------------------------------------------
| GET /api/projects
|--------------------------------------------------------------------------
*/

export async function GET(request: NextRequest) {
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

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status") || "";

    const priority =
      searchParams.get("priority") || "";

    const deadline =
      searchParams.get("deadline") || "";

    const pageParam =
      Number(searchParams.get("page")) || 1;

    const limitParam =
      Number(searchParams.get("limit")) || 50;

    const page = Math.max(pageParam, 1);

    const limit = Math.min(
      Math.max(limitParam, 1),
      100
    );

    const where: prisma.ProjectWhereInput = {
      userId: user.id,
    };

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    if (search) {
      where.OR = [
        {
          name: {
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

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    if (
      Object.values(ProjectStatus).includes(
        status as ProjectStatus
      )
    ) {
      where.status =
        status as ProjectStatus;
    }

    /*
    |--------------------------------------------------------------------------
    | Priority
    |--------------------------------------------------------------------------
    */

    if (
      Object.values(ProjectPriority).includes(
        priority as ProjectPriority
      )
    ) {
      where.priority =
        priority as ProjectPriority;
    }

    /*
    |--------------------------------------------------------------------------
    | Deadline filters
    |--------------------------------------------------------------------------
    */

    const now = new Date();

    if (deadline === "OVERDUE") {
      where.dueDate = {
        lt: now,
      };

      where.status = {
        not: ProjectStatus.COMPLETED,
      };
    }

    if (deadline === "TODAY") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      where.dueDate = {
        gte: start,
        lt: end,
      };
    }

    if (deadline === "THIS_WEEK") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      where.dueDate = {
        gte: start,
        lt: end,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Count
    |--------------------------------------------------------------------------
    */

    const total =
      await prisma.project.count({
        where,
      });

    const totalPages =
      Math.max(
        Math.ceil(total / limit),
        1
      );

    const safePage =
      Math.min(page, totalPages);

    /*
    |--------------------------------------------------------------------------
    | Fetch
    |--------------------------------------------------------------------------
    */

    const projects =
      await prisma.project.findMany({
        where,

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

        orderBy: [
          {
            status: "asc",
          },
          {
            dueDate: "asc",
          },
          {
            createdAt: "desc",
          },
        ],

        skip:
          (safePage - 1) * limit,

        take: limit,
      });

    /*
    |--------------------------------------------------------------------------
    | Calculate progress
    |--------------------------------------------------------------------------
    */

    const data = projects.map(
      (project) => {
        const totalSteps =
          project.tasks.length;

        const completedSteps =
          project.tasks.filter(
            (task) =>
              task.status ===
              "COMPLETED"
          ).length;

        const percentage =
          totalSteps === 0
            ? 0
            : Math.round(
                (completedSteps /
                  totalSteps) *
                  100
              );

        return {
          ...project,

          steps: project.tasks,

          progress: {
            total: totalSteps,
            completed:
              completedSteps,
            percentage,
          },
        };
      }
    );

    return NextResponse.json({
      data,

      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,

        hasNextPage:
          safePage < totalPages,

        hasPreviousPage:
          safePage > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/projects error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load projects.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/projects
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
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
    | Validation
    |--------------------------------------------------------------------------
    */

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Project name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status &&
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

    if (
      priority &&
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
    | Create
    |--------------------------------------------------------------------------
    */

    const project =
      await prisma.project.create({
        data: {
          userId: user.id,

          name: name.trim(),

          description:
            typeof description ===
            "string"
              ? description.trim() ||
                null
              : null,

          clientId:
            clientId || null,

          status:
            status ||
            ProjectStatus.PLANNING,

          priority:
            priority ||
            ProjectPriority.MEDIUM,

          startDate: startDate
            ? new Date(startDate)
            : null,

          dueDate: dueDate
            ? new Date(dueDate)
            : null,
        },

        include: {
          tasks: true,

          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        data: {
          ...project,

          steps: project.tasks,

          progress: {
            total: 0,
            completed: 0,
            percentage: 0,
          },
        },

        message:
          "Project created successfully.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/projects error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create project.",
      },
      {
        status: 500,
      }
    );
  }
}