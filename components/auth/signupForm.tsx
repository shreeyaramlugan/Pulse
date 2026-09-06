"use client";

import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/firebase/client";

export function SignupForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /**
   * Creates the server-side session after
   * Firebase authentication succeeds.
   */
  async function createServerSession(
    firebaseUser: typeof auth.currentUser
  ) {
    if (!firebaseUser) {
      throw new Error(
        "Authentication failed. Please try again."
      );
    }

    /*
     * 1. Get Firebase ID token
     */
    const idToken =
      await firebaseUser.getIdToken(true);

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
      }
    );

    /*
     * Always read the response as text first.
     * This prevents:
     *
     * Unexpected token '<'
     *
     * if Next.js returns an HTML error page.
     */
    const syncText =
      await syncResponse.text();

    let syncData: any = {};

    try {
      syncData = syncText
        ? JSON.parse(syncText)
        : {};
    } catch {
      console.error(
        "Invalid /api/auth/sync response:",
        syncText
      );

      throw new Error(
        "The server returned an invalid response while syncing your account."
      );
    }

    if (!syncResponse.ok) {
      throw new Error(
        syncData?.error ||
          "Unable to sync your account."
      );
    }

    /*
     * 3. Create secure HttpOnly session cookie
     */
    const sessionResponse = await fetch(
      "/api/auth/session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        "Invalid /api/auth/session response:",
        sessionText
      );

      throw new Error(
        "The server returned an invalid session response."
      );
    }

    if (!sessionResponse.ok) {
      throw new Error(
        sessionData?.error ||
          "Unable to create your login session."
      );
    }
  }

  /**
   * Email signup
   *
   * Firebase signup
   * ↓
   * getIdToken()
   * ↓
   * /api/auth/sync
   * ↓
   * /api/auth/session
   * ↓
   * /dashboard
   */
  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData =
      new FormData(event.currentTarget);

    const name = String(
      formData.get("name") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    ).trim();

    const password = String(
      formData.get("password") || ""
    );

    try {
      /*
       * 1. Create Firebase account
       */
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      /*
       * 2. Store display name in Firebase
       */
      await updateProfile(
        credential.user,
        {
          displayName: name,
        }
      );

      /*
       * 3. Sync + create server session
       */
      await createServerSession(
        credential.user
      );

      /*
       * 4. Redirect
       */
      router.replace("/dashboard");
    } catch (error: any) {
      console.error(
        "Email signup failed:",
        error
      );

      setError(
        getFirebaseError(error)
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * Google signup
   *
   * Google Firebase sign-in
   * ↓
   * getIdToken()
   * ↓
   * /api/auth/sync
   * ↓
   * /api/auth/session
   * ↓
   * /dashboard
   */
  async function handleGoogleSignup() {
    setLoading(true);
    setError("");

    try {
      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const credential =
        await signInWithPopup(
          auth,
          provider
        );

   await createServerSession(
        credential.user
      );

      /*
       * 4. Redirect
       */
      router.replace("/dashboard");
    }  catch (error: any) {
      console.error(
        "Google login failed:",
        error
      );

      setError(
        getFirebaseError(error)
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <form
      onSubmit={handleSignup}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-card-foreground"
        >
          Name
        </label>

        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            required
            disabled={loading}
            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-card-foreground"
        >
          Email
        </label>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={loading}
            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-card-foreground"
        >
          Password
        </label>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            id="password"
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={8}
            required
            disabled={loading}
            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (value) => !value
              )
            }
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Use at least 8 characters.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>

      {/* Divider */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>

        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />

        Continue with Google
      </button>
    </form>
  );
}

function getFirebaseError(error: any) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email. Please log in instead.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Your password must be at least 8 characters.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Please allow popups and try again.";

    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";

    default:
      return (
        error?.message ||
        "Something went wrong. Please try again."
      );
  }
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
      />

      <path
        fill="currentColor"
        d="M12 21.98c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-4.69-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.98Z"
      />

      <path
        fill="currentColor"
        d="M6.54 14.09a5.86 5.86 0 0 1 0-3.73V7.85H3.3a9.97 9.97 0 0 0 0 8.75l3.24-2.51Z"
      />

      <path
        fill="currentColor"
        d="M12 6.33c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.41 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.35l3.24 2.51C7.31 8.05 9.46 6.33 12 6.33Z"
      />
    </svg>
  );
}
