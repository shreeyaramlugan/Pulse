import Link from "next/link";

import { AuthShell } from "@/components/auth/authShell";
import { SignupForm } from "@/components/auth/signupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Build your system."
      description="Create your account and bring your work, goals, habits and business into one place."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:opacity-75"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}

