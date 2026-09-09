import { cookies } from "next/headers";
import { prisma } from "@/prisma";
import { adminAuth } from "@/firebase/admin";

export async function POST(request: Request) {
  try {
    /*
     * Accept token from either:
     *
     * Authorization: Bearer <token>
     *
     * OR
     *
     * { "idToken": "<token>" }
     */

    const authorization =
      request.headers.get("authorization");

    let idToken = "";

    if (
      authorization &&
      authorization.startsWith("Bearer ")
    ) {
      idToken = authorization.substring(7);
    }

    if (!idToken) {
      try {
        const body = await request.json();

        if (
          typeof body?.idToken === "string"
        ) {
          idToken = body.idToken;
        }
      } catch {
        // No JSON body
      }
    }

    if (!idToken) {
      return Response.json(
        {
          error:
            "Missing Firebase ID token.",
        },
        { status: 401 }
      );
    }

    /*
     * Verify Firebase token
     */
    const decodedToken =
      await adminAuth.verifyIdToken(idToken);

    /*
     * Firebase UID
     */
    const firebaseUid = decodedToken.uid;

    /*
     * Find the corresponding AuthAccount
     */
    const authAccount =
      await prisma.authAccount.findUnique({
        where: {
          provider_externalId: {
            provider: "GOOGLE",
            externalId: firebaseUid,
          },
        },
        include: {
          user: true,
        },
      });

    /*
     * If your email accounts are stored with
     * provider EMAIL, the query above may not
     * find them. Fall back to externalId.
     */
    const account =
      authAccount ??
      (await prisma.authAccount.findFirst({
        where: {
          externalId: firebaseUid,
        },
        include: {
          user: true,
        },
      }));

    if (!account) {
      return Response.json(
        {
          error:
            "Authentication account not found.",
        },
        { status: 404 }
      );
    }

    const user = account.user;

    /*
     * Create Firebase server-side session cookie
     *
     * 5 days
     */
    const expiresIn =
      60 * 60 * 24 * 5 * 1000;

    const sessionCookie =
      await adminAuth.createSessionCookie(
        idToken,
        {
          expiresIn,
        }
      );

    /*
     * Create response WITH user information
     */
    const response = Response.json({
      success: true,

      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,

        timezone: user.timezone,
        weekStartsOn: user.weekStartsOn,

        notificationPreference:
          user.notificationPreference,

        theme: user.theme,

        onboardingComplete:
          user.onboardingComplete,

        currency: user.currency,
        dateFormat: user.dateFormat,
        timeFormat: user.timeFormat,
        language: user.language,
      },
    });

    /*
     * Store secure session cookie
     */
    response.headers.append(
      "Set-Cookie",
      [
        `session=${sessionCookie}`,
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        `Max-Age=${Math.floor(
          expiresIn / 1000
        )}`,
        process.env.NODE_ENV ===
        "production"
          ? "Secure"
          : "",
      ]
        .filter(Boolean)
        .join("; ")
    );

    return response;
  } catch (error) {
    console.error(
      "Authentication session creation failed:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to create authentication session.",
      },
      { status: 401 }
    );
  }
}