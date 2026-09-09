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
          message: "You must be signed in to view projects.",
        },
        { status: 401 }
      );
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },

      select: {
        id: true,
        name: true,
        status: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return NextResponse.json(
      {
        error: "ServerError",
        message: "Failed to retrieve projects.",
      },
      { status: 500 }
    );
  }
}