
import Link from "next/link";

import { AuthShell } from "@/components/auth/authShell";
import { LoginForm } from "@/components/auth/loginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back."
      description="Sign in to continue managing your work, goals, habits and business."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:opacity-75"
          >
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}