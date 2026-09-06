
import "server-only";

import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/admin";

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

    return decodedClaims;
  } catch (error) {
    console.error("Auth verification failed:", error);

    return null;
  }
}
