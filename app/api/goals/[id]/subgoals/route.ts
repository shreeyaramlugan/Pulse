import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

/*                                                                         |
| -------------------------------------------------------------------------- |
| GET /api/goals/[id]/subgoals                                               |
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
| Verify parent goal belongs to user
|--------------------------------------------------------------------------
*/

const parentGoal =
  await prisma.goal.findFirst({
    where: {
      id,
      userId: user.id,
    },

    select: {
      id: true,
      title: true,
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

/*
|--------------------------------------------------------------------------
| Get direct children only
|--------------------------------------------------------------------------
*/

const subGoals =
  await prisma.goal.findMany({
    where: {
      userId: user.id,
      parentGoalId: id,
    },

    include: {
      _count: {
        select: {
          subGoals: true,
          tasks: true,
          progressEntries: true,
        },
      },
    },

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
  });

return NextResponse.json({
  data: subGoals,

  parentGoal,
});


} catch (error) {
console.error(
"GET /api/goals/[id]/subgoals error:",
error
);


return NextResponse.json(
  {
    message:
      "Failed to load sub-goals.",
  },
  {
    status: 500,
  }
);


}
}
