import { redirect } from "next/navigation";

import { prisma } from "@/prisma";

import { SettingsSidebar } from "@/components/settings/settingsSidebar";
import { ProfileSettings } from "@/components/settings/profileSettings";
import { AppearanceSettings } from "@/components/settings/appearanceSettings";
import { PreferenceSettings } from "@/components/settings/preferenceSettings";
import { NotificationSettings } from "@/components/settings/notificationSettings";
import { IntegrationsSettings } from "@/components/settings/integrationsSettings";
import { SecuritySettings } from "@/components/settings/securitySettings";

import { getCurrentUser } from "@/lib/auth";

type SettingsPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

const VALID_TABS = [
  "profile",
  "appearance",
  "preferences",
  "notifications",
  "integrations",
  "security",
] as const;

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  /**
   * Get the authenticated Firebase user.
   *
   * IMPORTANT:
   * authUser.id is not necessarily the Prisma User.id.
   *
   * Firebase uses `uid`.
   * Prisma User uses its own `cuid()`.
   *
   * We therefore resolve:
   *
   * Firebase UID
   *      ↓
   * AuthAccount.externalId
   *      ↓
   * AuthAccount.userId
   *      ↓
   * Prisma User
   */
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect("/login");
  }

  /**
   * Firebase Admin decoded users normally expose
   * the Firebase identifier as `uid`.
   *
   * If your getCurrentUser() helper returns `user.uid`,
   * this is the value we need.
   */
  const firebaseUid = authUser.uid;

  if (!firebaseUid) {
    console.error(
      "Authenticated user is missing Firebase UID."
    );

    redirect("/login");
  }

  /**
   * Find the Prisma user through AuthAccount.
   *
   * This prevents us from incorrectly assuming that
   * Firebase UID === Prisma User.id.
   */
  const authAccount =
    await prisma.authAccount.findFirst({
      where: {
        externalId: firebaseUid,
      },
      include: {
        user: {
          include: {
            authAccounts: true,
          },
        },
      },
    });

  if (!authAccount?.user) {
    console.error(
      "Authenticated Firebase user does not have a linked Prisma account.",
      {
        firebaseUid,
      }
    );

    /**
     * The user is authenticated with Firebase,
     * but their application account does not exist.
     *
     * Send them through login/signup rather than
     * attempting to query User with an undefined ID.
     */
    redirect("/login");
  }

  const user = authAccount.user;

  const params = await searchParams;

  const requestedTab = params.tab || "profile";

  const tab = VALID_TABS.includes(
    requestedTab as (typeof VALID_TABS)[number]
  )
    ? requestedTab
    : "profile";

  /**
   * Authentication providers linked to this user.
   *
   * Example:
   *
   * ["EMAIL"]
   *
   * or:
   *
   * ["EMAIL", "GOOGLE"]
   */
  const providers = user.authAccounts.map(
    (account) => account.provider
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium text-primary">
            NEXUS
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage your account, workspace and NEXUS
            preferences.
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">

          {/* Sidebar */}
          <SettingsSidebar />

          {/* Content */}
          <main className="min-w-0 flex-1">

            {/* Profile */}
            {tab === "profile" && (
              <ProfileSettings
                initialName={user.name}
                email={user.email}
                avatarUrl={user.avatarUrl}
                initialTimezone={user.timezone}
              />
            )}

            {/* Appearance */}
            {tab === "appearance" && (
              <AppearanceSettings />
            )}

            {/* Preferences */}
            {tab === "preferences" && (
              <PreferenceSettings
                initialWeekStartsOn={
                  user.weekStartsOn
                }
                initialCurrency={user.currency}
                initialDateFormat={
                  user.dateFormat
                }
                initialTimeFormat={
                  user.timeFormat
                }
                initialLanguage={user.language}
              />
            )}

            {/* Notifications */}
            {tab === "notifications" && (
              <NotificationSettings
                initialPreference={
                  user.notificationPreference as
                    | "ALL"
                    | "IMPORTANT"
                    | "NONE"
                }
              />
            )}

            {/* Integrations */}
            {tab === "integrations" && (
              <IntegrationsSettings />
            )}

            {/* Security */}
            {tab === "security" && (
              <SecuritySettings
                email={user.email}
                providers={providers}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
