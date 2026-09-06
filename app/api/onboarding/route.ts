import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/admin";
import { prisma } from "@/prisma";

const VALID_WEEK_STARTS = [
  "SUNDAY",
  "MONDAY",
] as const;

const VALID_NOTIFICATION_PREFERENCES = [
  "ALL",
  "IMPORTANT",
  "NONE",
] as const;

const validThemes = [
  "organic",
  "chai",
  "cyberpunk",
  "futuristic",
  "obsidian",
  "pink",
];



export async function POST(request: Request) {
  try {
    /*
     * Get authentication session
     */
    const cookieStore = await cookies();

    const sessionCookie =
      cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return Response.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    /*
     * Verify Firebase session
     */
    const decodedClaims =
      await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      );

    const firebaseUid = decodedClaims.uid;

    /*
     * Find the Prisma user through
     * their Firebase authentication account.
     */
    const authAccount =
      await prisma.authAccount.findFirst({
        where: {
          externalId: firebaseUid,
        },
        include: {
          user: true,
        },
      });

    if (!authAccount) {
      return Response.json(
        {
          error:
            "Authentication account is not linked to a user.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    console.log( "ONBOARDING BODY:", JSON.stringify(body, null, 2) );


    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const weekStart = body.weekStart;

    const notificationPreference =
      body.notificationPreference;

    const theme = body.theme;

    /*
     * Validate name
     */
    if (!name) {
      return Response.json(
        {
          error: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return Response.json(
        {
          error:
            "Name must be 100 characters or less.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate week start
     */
    
    if (
      !VALID_WEEK_STARTS.includes(
        weekStart
      )
    ) {
      return Response.json(
        {
          error:
            "Invalid week start preference.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate notification preference
     */
    if (
      !VALID_NOTIFICATION_PREFERENCES.includes(
        notificationPreference
      )
    ) {
      return Response.json(
        {
          error:
            "Invalid notification preference.",
        },
        { status: 400 }
      );
    }

    /*
     * Validate theme
     */
const requestedTheme = String(
  body.theme || "organic"
).trim().toLowerCase();

if (!validThemes.includes(requestedTheme)) {
  return Response.json(
    { error: "Invalid theme." },
    { status: 400 }
  );
} 

    /*
     * Update existing Prisma user
     */
const user = await prisma.user.update({
  where: {
    id: authAccount.userId,
  },
  data: {
    name: name.trim(),

    weekStartsOn:
      weekStart === "SUNDAY" ? 0 : 1,

    notificationPreference,

    theme: requestedTheme,

    onboardingComplete: true,
  },
});
    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Onboarding failed:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to save onboarding preferences.",
      },
      { status: 500 }
    );
  }
}

