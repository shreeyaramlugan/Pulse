import { NextResponse } from "next/server";

import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "You must be signed in to view your goals.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 2. Query parameters
    // ---------------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const search =
      searchParams.get("search");

    const status =
      searchParams.get("status");

    const priority =
      searchParams.get("priority");

    const period =
      searchParams.get("period");

    const progressType =
      searchParams.get("progressType");

    const includeArchived =
      searchParams.get("includeArchived") ===
      "true";

    // ---------------------------------------------------------
    // 3. Pagination
    // ---------------------------------------------------------

    const page = Math.max(
      Number(
        searchParams.get("page") || 1
      ),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(
          searchParams.get("limit") || 50
        ),
        1
      ),
      100
    );

    const skip =
      (page - 1) * limit;

    // ---------------------------------------------------------
    // 4. Build filters
    // ---------------------------------------------------------

    const where: any = {
      userId: user.id,

      // Only show top-level goals on the main Goals page.
      // Sub-goals are loaded through their parent goal.
      parentGoalId: null,
    };

    // Don't show archived goals unless requested.
    if (
      !includeArchived &&
      !status
    ) {
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

    if (period) {
      where.period = period;
    }

    if (progressType) {
      where.progressType =
        progressType;
    }

    // ---------------------------------------------------------
    // 5. Search
    // ---------------------------------------------------------

    if (search?.trim()) {
      where.OR = [
        {
          title: {
            contains:
              search.trim(),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains:
              search.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    // ---------------------------------------------------------
    // 6. Fetch goals + total
    // ---------------------------------------------------------

    const [goals, total] =
      await prisma.$transaction([
        prisma.goal.findMany({
          where,

          include: {
            // -------------------------------------------------
            // Parent goal
            // -------------------------------------------------

            parentGoal: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },

            // -------------------------------------------------
            // Sub-goals
            // -------------------------------------------------

            subGoals: {
              orderBy: {
                createdAt: "asc",
              },

              select: {
                id: true,
                title: true,
                description: true,

                parentGoalId: true,

                period: true,
                status: true,
                priority: true,

                progressType: true,

                metricType: true,
                metricName: true,
                unit: true,
                metricDirection: true,

                startValue: true,
                currentValue: true,
                targetValue: true,

                startDate: true,
                targetDate: true,
                completedAt: true,

                createdAt: true,
                updatedAt: true,

                _count: {
                  select: {
                    subGoals: true,
                    tasks: true,
                    progressEntries: true,
                  },
                },
              },
            },

            // -------------------------------------------------
            // Counts
            // -------------------------------------------------

            _count: {
              select: {
                subGoals: true,
                tasks: true,
                progressEntries: true,
              },
            },
          },

          // ---------------------------------------------------
          // Sorting
          // ---------------------------------------------------

          orderBy: [
            {
              targetDate: "asc",
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

        prisma.goal.count({
          where,
        }),
      ]);

    // ---------------------------------------------------------
    // 7. Return results
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,

      data: goals,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total / limit
          ),

        hasNextPage:
          page * limit < total,

        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get goals error:",
      error
    );

    return NextResponse.json(
      {
        error: "ServerError",
        message:
          "Failed to retrieve goals.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "You must be signed in to create a goal.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 2. Request body
    // ---------------------------------------------------------

    const body =
      await request.json();

    const {
      title,
      description,

      parentGoalId,

      period,
      status,
      priority,

      progressType,

      metricType,
      metricName,
      unit,
      metricDirection,

      startValue,
      currentValue,
      targetValue,

      startDate,
      targetDate,
    } = body;

    // ---------------------------------------------------------
    // 3. Basic validation
    // ---------------------------------------------------------

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message:
            "Goal title is required.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 4. Validate parent goal
    // ---------------------------------------------------------

    if (parentGoalId) {
      const parentGoal =
        await prisma.goal.findFirst({
          where: {
            id: parentGoalId,
            userId: user.id,
          },
        });

      if (!parentGoal) {
        return NextResponse.json(
          {
            error:
              "InvalidParentGoal",
            message:
              "Parent goal not found or does not belong to you.",
          },
          { status: 400 }
        );
      }
    }

    // ---------------------------------------------------------
    // 5. Validate metric configuration
    // ---------------------------------------------------------

    if (
      progressType === "METRIC"
    ) {
      if (
        targetValue ===
          undefined ||
        targetValue === null ||
        targetValue === ""
      ) {
        return NextResponse.json(
          {
            error:
              "ValidationError",
            message:
              "Target value is required for metric goals.",
          },
          { status: 400 }
        );
      }

      if (
        Number(targetValue) === 0
      ) {
        return NextResponse.json(
          {
            error:
              "ValidationError",
            message:
              "Target value cannot be zero.",
          },
          { status: 400 }
        );
      }
    }

    // ---------------------------------------------------------
    // 6. Create goal
    // ---------------------------------------------------------

    const goal =
      await prisma.goal.create({
        data: {
          userId: user.id,

          title: title.trim(),

          description:
            description &&
            typeof description ===
              "string"
              ? description.trim()
              : null,

          parentGoalId:
            parentGoalId || null,

          period:
            period || "MONTHLY",

          status:
            status || "ACTIVE",

          priority:
            priority || "MEDIUM",

          progressType:
            progressType || "MANUAL",

          metricType:
            progressType === "METRIC"
              ? metricType ||
                "NUMBER"
              : null,

          metricName:
            progressType === "METRIC"
              ? metricName?.trim() ||
                null
              : null,

          unit:
            progressType === "METRIC"
              ? unit?.trim() || null
              : null,

          metricDirection:
            progressType === "METRIC"
              ? metricDirection ||
                "INCREASE"
              : "INCREASE",

          startValue:
            progressType === "METRIC" &&
            startValue !==
              undefined &&
            startValue !== null &&
            startValue !== ""
              ? Number(startValue)
              : null,

          currentValue:
            progressType === "METRIC" &&
            currentValue !==
              undefined &&
            currentValue !== null &&
            currentValue !== ""
              ? Number(currentValue)
              : null,

          targetValue:
            progressType === "METRIC" &&
            targetValue !==
              undefined &&
            targetValue !== null &&
            targetValue !== ""
              ? Number(targetValue)
              : null,

          startDate:
            startDate
              ? new Date(startDate)
              : null,

          targetDate:
            targetDate
              ? new Date(targetDate)
              : null,
        },

        include: {
          parentGoal: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },

          subGoals: true,

          _count: {
            select: {
              subGoals: true,
              tasks: true,
              progressEntries: true,
            },
          },
        },
      });

    // ---------------------------------------------------------
    // 7. Return
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          parentGoalId
            ? "Sub-goal created successfully."
            : "Goal created successfully.",
        data: goal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create goal error:",
      error
    );

    return NextResponse.json(
      {
        error: "ServerError",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create goal.",
      },
      { status: 500 }
    );
  }
}
