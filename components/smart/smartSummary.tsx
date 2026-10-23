"use client";

type IntelligenceSummaryProps = {
  totalTasks: number;
  overdueTasks: number;
  urgentTasks: number;
  blockedTasks: number;
  todayTasks: number;
  workloadScore: number;
  completionRate: number;
};

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border p-5">
      <p className="text-sm opacity-60">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs opacity-50">
        {description}
      </p>
    </div>
  );
}

export default function IntelligenceSummary({
  totalTasks,
  overdueTasks,
  urgentTasks,
  blockedTasks,
  todayTasks,
  workloadScore,
  completionRate,
}: IntelligenceSummaryProps) {
  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Intelligence Overview
        </h2>

        <p className="mt-1 text-sm opacity-60">
          What your workspace looks like right now.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Tasks"
          value={totalTasks}
          description={`${todayTasks} recommended for today`}
        />

        <SummaryCard
          label="Urgent"
          value={urgentTasks}
          description="High-priority attention required"
        />

        <SummaryCard
          label="Blocked"
          value={blockedTasks}
          description="Waiting on dependencies"
        />

        <SummaryCard
          label="Overdue"
          value={overdueTasks}
          description="Tasks past their deadline"
        />

        <SummaryCard
          label="Workload"
          value={`${workloadScore}%`}
          description="Current capacity pressure"
        />

        <SummaryCard
          label="Completion"
          value={`${completionRate}%`}
          description="Overall task completion"
        />
      </div>
    </section>
  );
}