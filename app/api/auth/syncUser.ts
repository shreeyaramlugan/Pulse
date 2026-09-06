
"use client";

import type { User } from "firebase/auth";

export async function syncUserWithDatabase(
  firebaseUser: User
) {
  /*
   * 1. Get the Firebase ID token
   */
  const idToken = await firebaseUser.getIdToken(true);

  if (!idToken) {
    throw new Error(
      "Unable to obtain Firebase authentication token."
    );
  }

  /*
   * 2. Sync Firebase user with Prisma
   */
  const syncResponse = await fetch(
    "/api/auth/sync",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  const syncText = await syncResponse.text();

  let syncData: any = {};

  try {
    syncData = syncText
      ? JSON.parse(syncText)
      : {};
  } catch {
    console.error(
      "Invalid JSON from /api/auth/sync:",
      syncText
    );

    throw new Error(
      "Authentication server returned an invalid response."
    );
  }

  if (!syncResponse.ok) {
    throw new Error(
      syncData?.error ||
        "Unable to sync user with database."
    );
  }

  /*
   * 3. Create our server-side authentication session
   */
  const sessionResponse = await fetch(
    "/api/auth/session",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        idToken,
      }),
    }
  );

  const sessionText =
    await sessionResponse.text();

  let sessionData: any = {};

  try {
    sessionData = sessionText
      ? JSON.parse(sessionText)
      : {};
  } catch {
    console.error(
      "Invalid JSON from /api/auth/session:",
      sessionText
    );

    throw new Error(
      "Authentication server returned an invalid session response."
    );
  }

  if (!sessionResponse.ok) {
    console.error(
      "Session creation failed:",
      sessionData
    );

    throw new Error(
      sessionData?.error ||
        "Unable to create authentication session."
    );
  }

  return {
    user: syncData.user,
    isNewUser: syncData.isNewUser,
    session: sessionData,
  };
}
