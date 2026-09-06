
import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/admin";
import { prisma } from "@/prisma";

import { OnboardingForm } from "@/components/auth/onboardingForm";

export default async function OnboardingPage() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get("session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  let decodedClaims;

  try {
    decodedClaims =
      await adminAuth.verifySessionCookie(
        sessionCookie,
        true
      );
  } catch {
    redirect("/login");
  }

  const authAccount =
    await prisma.authAccount.findFirst({
      where: {
        externalId: decodedClaims.uid,
      },
      include: {
        user: true,
      },
    });

  if (!authAccount) {
    redirect("/login");
  }

  /*
   * Don't show onboarding again once completed.
   */
  if (
    authAccount.user.onboardingCompleted
  ) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <OnboardingForm
          initialName={
            authAccount.user.name ===
            "Pulse User"
              ? ""
              : authAccount.user.name
          }
        />
      </div>
    </main>
  );
}

