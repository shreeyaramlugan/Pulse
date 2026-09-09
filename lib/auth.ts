
import "server-only";

import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/admin";
import { prisma } from "@/prisma";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const session = cookieStore.get("session")?.value;

    if (!session) {
      return null;
    }

    const decodedClaims =
      await adminAuth.verifySessionCookie(
        session,
        true
      );

const user = await prisma.user.upsert({
  where: {
    email: decodedClaims.email!,
  },
  update: {
    name: decodedClaims.name || "User",
    avatarUrl: decodedClaims.picture || null,
  },
  create: {
    email: decodedClaims.email!,
    name: decodedClaims.name || "User",
    avatarUrl: decodedClaims.picture || null,
  },
});
    return user;
  } catch (error) {
    console.error("Auth verification failed:", error);

    return null;
  }
}
