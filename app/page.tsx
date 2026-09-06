import { ThemeSelector } from "@/components/theme/themeSelector";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
            Pulse
          </p>

          <h1 className="text-4xl font-bold">
            Your workspace.
          </h1>

          <p className="mt-2 text-muted-foreground">
            Choose the visual language for your productivity system.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-theme)]">
          <ThemeSelector />
        </div>
      </div>
    </main>
  );
}

