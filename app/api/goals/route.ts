import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be signed in to view goals.",
        },
        { status: 401 }
      );
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
      },

      select: {
        id: true,
        title: true,
        targetDate: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error("Get goals error:", error);

    return NextResponse.json(
      {
        error: "ServerError",
        message: "Failed to retrieve goals.",
      },
      { status: 500 }
    );
  }
}