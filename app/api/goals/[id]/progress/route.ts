import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

/*                                                                         |
| -------------------------------------------------------------------------- |
| IMPORTANT                                                                  |
| -------------------------------------------------------------------------- |
|                                                                            |
| Replace this with the same auth helper used by your Tasks/Goals routes.    |
|                                                                            |*/
import { getCurrentUser } from "@/lib/auth";

/*                                                                         |
| -------------------------------------------------------------------------- |
| GET /api/goals/[id]/progress                                               |
| -------------------------------------------------------------------------- |
|                                                                            |
| Returns progress history for a goal.                                       |
|                                                                            |*/

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
    {
      message: "Unauthorized.",
    },
    {
      status: 401,
    }
  );
}

const { id } = await context.params;

/*
|--------------------------------------------------------------------------
| Verify goal ownership
|--------------------------------------------------------------------------
*/

const goal =
  await prisma.goal.findFirst({
    where: {
      id,
      userId: user.id,
    },

    select: {
      id: true,
      title: true,
      progressType: true,
      metricType: true,
      unit: true,
      startValue: true,
      currentValue: true,
      targetValue: true,
      metricDirection: true,
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

const progressEntries =
  await prisma.goalProgressEntry.findMany(
    {
      where: {
        goalId: id,
      },

      orderBy: {
        recordedAt: "desc",
      },

      take: 100,
    }
  );

return NextResponse.json({
  data: progressEntries,

  goal,
});

} catch (error) {
console.error(
"GET /api/goals/[id]/progress error:",
error
);

return NextResponse.json(
  {
    message:
      "Failed to load progress history.",
  },
  {
    status: 500,
  }
);


}
}

/*                                                                         |
| -------------------------------------------------------------------------- |
| POST /api/goals/[id]/progress                                              |
| -------------------------------------------------------------------------- |
|                                                                            |
| Records a new progress value.                                              |
|                                                                            |
| Example:                                                                   |
|                                                                            |
| {                                                                          |
| "value": 7500,                                                             |
| "note": "Completed two client projects"                                    |
| }                                                                          |
|                                                                            |*/


export async function POST(
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

/*
|--------------------------------------------------------------------------
| Verify goal ownership
|--------------------------------------------------------------------------
*/

const goal =
  await prisma.goal.findFirst({
    where: {
      id,
      userId: user.id,
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

const body = await request.json();

const rawValue =
  body.value;

/*
|--------------------------------------------------------------------------
| Validate value
|--------------------------------------------------------------------------
*/

if (
  rawValue === undefined ||
  rawValue === null ||
  rawValue === ""
) {
  return NextResponse.json(
    {
      message:
        "Progress value is required.",
    },
    {
      status: 400,
    }
  );
}

const value = Number(rawValue);

if (!Number.isFinite(value)) {
  return NextResponse.json(
    {
      message:
        "Progress value must be a valid number.",
    },
    {
      status: 400,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Note
|--------------------------------------------------------------------------
*/

const note =
  typeof body.note ===
    "string" &&
  body.note.trim()
    ? body.note.trim()
    : null;

/*
|--------------------------------------------------------------------------
| Record progress
|--------------------------------------------------------------------------
*/

const progressEntry =
  await prisma.goalProgressEntry.create(
    {
      data: {
        goalId: id,

        value,

        note,
      },
    }
  );

/*
|--------------------------------------------------------------------------
| Update current value
|--------------------------------------------------------------------------
|
| Current value is useful for metric goals.
|
*/

if (
  goal.progressType ===
  "METRIC"
) {
  await prisma.goal.update({
    where: {
      id,
    },

    data: {
      currentValue: value,
    },
  });
}

return NextResponse.json(
  {
    message:
      "Progress recorded successfully.",

    data: progressEntry,
  },
  {
    status: 201,
  }
);

} catch (error) {
console.error(
"POST /api/goals/[id]/progress error:",
error
);

return NextResponse.json(
  {
    message:
      "Failed to record progress.",
  },
  {
    status: 500,
  }
);

}
}
