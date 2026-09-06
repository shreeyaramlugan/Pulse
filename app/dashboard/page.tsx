
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main>
      <h1>Welcome to Pulse</h1>

      <p>
        Signed in as {user.email}
      </p>

      <p>
        Firebase UID: {user.uid}
      </p>
    </main>
  );
}
