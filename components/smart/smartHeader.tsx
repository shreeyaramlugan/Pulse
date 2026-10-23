"use client";

type IntelligenceHeaderProps = {
  onRefresh?: () => void;
  loading?: boolean;
};

export default function IntelligenceHeader({
  onRefresh,
  loading = false,
}: IntelligenceHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-wider opacity-60">
          Pulse Intelligence
        </p>

        <h1 className="text-3xl font-bold">
          Smart Workspace
        </h1>

        <p className="mt-2 max-w-2xl opacity-60">
          Your tasks, goals and projects analysed together
          to determine what deserves your attention next.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-70 disabled:opacity-40"
      >
        {loading ? "Analysing..." : "↻ Re-analyse"}
      </button>
    </div>
  );
}