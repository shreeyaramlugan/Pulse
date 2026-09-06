
import { adminAuth } from "@/firebase/admin";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization) {
      return Response.json(
        {
          error: "Missing authorization token",
        },
        { status: 401 }
      );
    }

    if (!authorization.startsWith("Bearer ")) {
      return Response.json(
        {
          error: "Invalid authorization format",
        },
        { status: 401 }
      );
    }

    const idToken = authorization.substring(7);

    const decodedToken =
      await adminAuth.verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email ?? "";

    /*
     * First check whether this Firebase account
     * is already linked to a User.
     *
     * This is what guarantees that Google/email
     * authentication maps back to the same User.id.
     */
    const existingAccount =
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

    if (existingAccount) {
      return Response.json({
        success: true,
        user: existingAccount.user,
        isNewUser: false,
      });
    }

    /*
     * Before creating a new User, check whether
     * the email already exists.
     *
     * This prevents duplicate User records.
     */
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    const user = await prisma.$transaction(
      async (tx) => {
        let userRecord = existingUser;

        if (!userRecord) {
          userRecord = await tx.user.create({
            data: {
              email,
              name:
                decodedToken.name ??
                "NEXUS User",
              avatarUrl:
                decodedToken.picture ??
                null,
            },
          });
        }

        await tx.authAccount.create({
          data: {
            userId: userRecord.id,
            provider: "GOOGLE",
            externalId: firebaseUid,
            email: email || null,
          },
        });

        return userRecord;
      }
    );

    return Response.json({
      success: true,
      user,
      isNewUser: true,
    });
  } catch (error) {
    console.error(
      "NEXUS user sync failed:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to create or sync user",
      },
      { status: 500 }
    );
  }
}
