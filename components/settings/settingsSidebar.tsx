"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  Palette,
  SlidersHorizontal,
  Bell,
  Plug,
  Shield,
  Settings,
} from "lucide-react";

type SettingsSection = {
  id:
    | "profile"
    | "appearance"
    | "preferences"
    | "notifications"
    | "integrations"
    | "security";
  label: string;
  description: string;
  icon: React.ElementType;
};

const sections: {
  title: string;
  items: SettingsSection[];
}[] = [
  {
    title: "Account",
    items: [
      {
        id: "profile",
        label: "Profile",
        description: "Your personal information",
        icon: User,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        id: "appearance",
        label: "Appearance",
        description: "Theme and visual preferences",
        icon: Palette,
      },
      {
        id: "preferences",
        label: "Preferences",
        description: "Regional and workspace settings",
        icon: SlidersHorizontal,
      },
      {
        id: "notifications",
        label: "Notifications",
        description: "Control your notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "Connections",
    items: [
      {
        id: "integrations",
        label: "Integrations",
        description: "Connected services",
        icon: Plug,
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        id: "security",
        label: "Authentication",
        description: "Login and account security",
        icon: Shield,
      },
    ],
  },
];

export function SettingsSidebar() {
  const searchParams = useSearchParams();

  const activeTab =
    searchParams.get("tab") || "profile";

  return (
    <aside className="w-full shrink-0 lg:w-64">
      {/* Mobile / tablet heading */}
      <div className="mb-5 flex items-center gap-3 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Settings className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Settings
          </h2>

          <p className="text-xs text-muted-foreground">
            Manage your workspace
          </p>
        </div>
      </div>

      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;

                return (
                  <Link
                    key={item.id}
                    href={`/settings?tab=${item.id}`}
                    aria-current={
                      active ? "page" : undefined
                    }
                    className={[
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-ring/30",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        "transition-colors duration-200",
                        active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={[
                          "text-sm font-medium",
                          active
                            ? "text-primary"
                            : "text-foreground",
                        ].join(" ")}
                      >
                        {item.label}
                      </p>

                      <p className="truncate text-[11px] text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
