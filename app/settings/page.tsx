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
   * getCurrentUser() verifies the Firebase session cookie and returns
   * the matching Prisma User, so `authUser.id` IS the Prisma User.id.
   */
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { authAccounts: true },
  });

  if (!user) {
    redirect("/login");
  }

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
            PULSE
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage your account, workspace and PULSE
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
