import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

const VALID_STATUSES = [
"ACTIVE",
"COMPLETED",
"PAUSED",
"CANCELLED",
"ARCHIVED",
] as const;

const VALID_PRIORITIES = [
"LOW",
"MEDIUM",
"HIGH",
"URGENT",
] as const;

const VALID_PERIODS = [
"DAILY",
"WEEKLY",
"MONTHLY",
"QUARTERLY",
"ANNUAL",
] as const;

const VALID_PROGRESS_TYPES = [
"MANUAL",
"METRIC",
"SUBGOALS",
] as const;

const VALID_METRIC_TYPES = [
"NUMBER",
"CURRENCY",
"PERCENTAGE",
"HOURS",
"MINUTES",
"CUSTOM",
] as const;

const VALID_METRIC_DIRECTIONS = [
"INCREASE",
"DECREASE",
] as const;

function isValidEnum<T extends readonly string[]>(
value: unknown,
values: T
): value is T[number] {
return (
typeof value === "string" &&
values.includes(value)
);
}

function parseDate(
value: unknown
): Date | null {
if (!value) return null;

if (typeof value !== "string") {
return null;
}

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return null;
}

return date;
}

function parseDecimal(
value: unknown
): number | null {
if (
value === null ||
value === undefined ||
value === ""
) {
return null;
}

const parsed = Number(value);

if (!Number.isFinite(parsed)) {
return null;
}

return parsed;
}

 /*                                                                         |
| -------------------------------------------------------------------------- |
| GET /api/goals/[id]                                                        |
| -------------------------------------------------------------------------- |*/

export async function GET(
request: NextRequest,
context: {
params: Promise<{ id: string }>;
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

const { id } = await context.params;

const goal =
  await prisma.goal.findFirst({
    where: {
      id,
      userId: user.id,
    },

    include: {
      parentGoal: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },

      subGoals: {
        orderBy: [
          {
            status: "asc",
          },
          {
            targetDate: "asc",
          },
          {
            createdAt: "asc",
          },
        ],

        include: {
          _count: {
            select: {
              subGoals: true,
              tasks: true,
              progressEntries: true,
            },
          },
        },
      },

      tasks: {
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          completedAt: true,
        },
      },

      progressEntries: {
        orderBy: {
          recordedAt: "desc",
        },

        take: 50,
      },

      _count: {
        select: {
          subGoals: true,
          tasks: true,
          progressEntries: true,
        },
      },
    },
  });

if (!goal) {
  return NextResponse.json(
    {
      message: "Goal not found.",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json({
  data: goal,
});

} catch (error) {
console.error(
"GET /api/goals/[id] error:",
error
);


return NextResponse.json(
  {
    message: "Failed to load goal.",
  },
  {
    status: 500,
  }
);


}
}

/*                                                                         |
| -------------------------------------------------------------------------- |
| PATCH /api/goals/[id]                                                      |
| -------------------------------------------------------------------------- | */
export async function PATCH(
request: NextRequest,
context: {
params: Promise<{ id: string }>;
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

const { id } = await context.params;

const existingGoal =
  await prisma.goal.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

if (!existingGoal) {
  return NextResponse.json(
    {
      message: "Goal not found.",
    },
    {
      status: 404,
    }
  );
}

const body = await request.json();

const data: Record<string, unknown> =
  {};

/*
|--------------------------------------------------------------------------
| Basic fields
|--------------------------------------------------------------------------
*/

if ("title" in body) {
  if (
    typeof body.title !== "string" ||
    !body.title.trim()
  ) {
    return NextResponse.json(
      {
        message:
          "Goal title cannot be empty.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    body.title.trim().length > 200
  ) {
    return NextResponse.json(
      {
        message:
          "Goal title must be 200 characters or less.",
      },
      {
        status: 400,
      }
    );
  }

  data.title = body.title.trim();
}

if ("description" in body) {
  data.description =
    typeof body.description ===
      "string" &&
    body.description.trim()
      ? body.description.trim()
      : null;
}

/*
|--------------------------------------------------------------------------
| Enums
|--------------------------------------------------------------------------
*/

if ("status" in body) {
  if (
    !isValidEnum(
      body.status,
      VALID_STATUSES
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid goal status.",
      },
      {
        status: 400,
      }
    );
  }

  data.status = body.status;
}

if ("priority" in body) {
  if (
    !isValidEnum(
      body.priority,
      VALID_PRIORITIES
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid goal priority.",
      },
      {
        status: 400,
      }
    );
  }

  data.priority = body.priority;
}

if ("period" in body) {
  if (
    !isValidEnum(
      body.period,
      VALID_PERIODS
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid goal period.",
      },
      {
        status: 400,
      }
    );
  }

  data.period = body.period;
}

if ("progressType" in body) {
  if (
    !isValidEnum(
      body.progressType,
      VALID_PROGRESS_TYPES
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid progress type.",
      },
      {
        status: 400,
      }
    );
  }

  data.progressType =
    body.progressType;
}

/*
|--------------------------------------------------------------------------
| Parent goal
|--------------------------------------------------------------------------
*/

if ("parentGoalId" in body) {
  const parentGoalId =
    body.parentGoalId || null;

  if (parentGoalId === id) {
    return NextResponse.json(
      {
        message:
          "A goal cannot be its own parent.",
      },
      {
        status: 400,
      }
    );
  }

  if (parentGoalId) {
    const parentGoal =
      await prisma.goal.findFirst({
        where: {
          id: parentGoalId,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

    if (!parentGoal) {
      return NextResponse.json(
        {
          message:
            "Parent goal not found.",
        },
        {
          status: 404,
        }
      );
    }
  }

  data.parentGoalId =
    parentGoalId;
}

/*
|--------------------------------------------------------------------------
| Metric fields
|--------------------------------------------------------------------------
*/

if ("metricType" in body) {
  if (
    body.metricType !== null &&
    !isValidEnum(
      body.metricType,
      VALID_METRIC_TYPES
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid metric type.",
      },
      {
        status: 400,
      }
    );
  }

  data.metricType =
    body.metricType || null;
}

if ("metricName" in body) {
  data.metricName =
    typeof body.metricName ===
      "string" &&
    body.metricName.trim()
      ? body.metricName.trim()
      : null;
}

if ("unit" in body) {
  data.unit =
    typeof body.unit ===
      "string" &&
    body.unit.trim()
      ? body.unit.trim()
      : null;
}

if ("metricDirection" in body) {
  if (
    !isValidEnum(
      body.metricDirection,
      VALID_METRIC_DIRECTIONS
    )
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid metric direction.",
      },
      {
        status: 400,
      }
    );
  }

  data.metricDirection =
    body.metricDirection;
}

if ("startValue" in body) {
  const value =
    parseDecimal(body.startValue);

  if (
    body.startValue !== null &&
    body.startValue !== "" &&
    value === null
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid starting value.",
      },
      {
        status: 400,
      }
    );
  }

  data.startValue = value;
}

if ("currentValue" in body) {
  const value =
    parseDecimal(
      body.currentValue
    );

  if (
    body.currentValue !== null &&
    body.currentValue !== "" &&
    value === null
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid current value.",
      },
      {
        status: 400,
      }
    );
  }

  data.currentValue = value;
}

if ("targetValue" in body) {
  const value =
    parseDecimal(
      body.targetValue
    );

  if (
    body.targetValue !== null &&
    body.targetValue !== "" &&
    value === null
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid target value.",
      },
      {
        status: 400,
      }
    );
  }

  data.targetValue = value;
}

/*
|--------------------------------------------------------------------------
| Dates
|--------------------------------------------------------------------------
*/

if ("startDate" in body) {
  if (
    body.startDate === null ||
    body.startDate === ""
  ) {
    data.startDate = null;
  } else {
    const date =
      parseDate(body.startDate);

    if (!date) {
      return NextResponse.json(
        {
          message:
            "Invalid start date.",
        },
        {
          status: 400,
        }
      );
    }

    data.startDate = date;
  }
}

if ("targetDate" in body) {
  if (
    body.targetDate === null ||
    body.targetDate === ""
  ) {
    data.targetDate = null;
  } else {
    const date =
      parseDate(body.targetDate);

    if (!date) {
      return NextResponse.json(
        {
          message:
            "Invalid target date.",
        },
        {
          status: 400,
        }
      );
    }

    data.targetDate = date;
  }
}

/*
|--------------------------------------------------------------------------
| Validate date relationship
|--------------------------------------------------------------------------
*/

const finalStartDate =
  "startDate" in data
    ? (data.startDate as
        | Date
        | null)
    : existingGoal.startDate;

const finalTargetDate =
  "targetDate" in data
    ? (data.targetDate as
        | Date
        | null)
    : existingGoal.targetDate;

if (
  finalStartDate &&
  finalTargetDate &&
  finalTargetDate <
    finalStartDate
) {
  return NextResponse.json(
    {
      message:
        "Target date cannot be before the start date.",
    },
    {
      status: 400,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Validate metric goal
|--------------------------------------------------------------------------
*/

const finalProgressType =
  "progressType" in data
    ? data.progressType
    : existingGoal.progressType;

if (
  finalProgressType ===
  "METRIC"
) {
  const finalMetricType =
    "metricType" in data
      ? data.metricType
      : existingGoal.metricType;

  const finalTargetValue =
    "targetValue" in data
      ? data.targetValue
      : existingGoal.targetValue;

  if (!finalMetricType) {
    return NextResponse.json(
      {
        message:
          "Metric type is required for metric goals.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    finalTargetValue === null ||
    finalTargetValue === undefined
  ) {
    return NextResponse.json(
      {
        message:
          "Target value is required for metric goals.",
      },
      {
        status: 400,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| Completion timestamp
|--------------------------------------------------------------------------
*/

if (
  "status" in data
) {
  if (
    data.status ===
    "COMPLETED"
  ) {
    data.completedAt =
      existingGoal.completedAt ??
      new Date();
  }

  if (
    data.status !==
    "COMPLETED"
  ) {
    data.completedAt = null;
  }
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

const updatedGoal =
  await prisma.goal.update({
    where: {
      id,
    },

    data,

    include: {
      _count: {
        select: {
          subGoals: true,
          tasks: true,
          progressEntries: true,
        },
      },
    },
  });

return NextResponse.json({
  message:
    "Goal updated successfully.",

  data: updatedGoal,
});


} catch (error) {
console.error(
"PATCH /api/goals/[id] error:",
error
);

return NextResponse.json(
  {
    message:
      "Failed to update goal.",
  },
  {
    status: 500,
  }
);


}
}
 /*                                                                         |
| -------------------------------------------------------------------------- |
| DELETE /api/goals/[id]                                                     |
| -------------------------------------------------------------------------- | */
export async function DELETE(
request: NextRequest,
context: {
params: Promise<{ id: string }>;
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

const { id } = await context.params;

const goal =
  await prisma.goal.findFirst({
    where: {
      id,
      userId: user.id,
    },

    select: {
      id: true,
    },
  });

if (!goal) {
  return NextResponse.json(
    {
      message: "Goal not found.",
    },
    {
      status: 404,
    }
  );
}

await prisma.goal.delete({
  where: {
    id,
  },
});

return NextResponse.json({
  message:
    "Goal deleted successfully.",
});

} catch (error) {
console.error(
"DELETE /api/goals/[id] error:",
error
);


return NextResponse.json(
  {
    message:
      "Failed to delete goal.",
  },
  {
    status: 500,
  }
);


}
}
