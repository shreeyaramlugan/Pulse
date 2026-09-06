import { adminAuth } from "@/firebase/admin";

export async function POST(
  request: Request
) {
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
     * Verify the Firebase ID token first.
     */
    await adminAuth.verifyIdToken(
      idToken
    );

    /*
     * Create a Firebase server-side
     * session cookie.
     *
     * 5 days.
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
     * Store the session in an HTTP-only cookie.
     */
    const response = Response.json({
      success: true,
    });

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
