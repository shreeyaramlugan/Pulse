"use client";

export type SmartTask = {
  id: string;
  title: string;
  description?: string | null;

  status?: string;
  priority?: string;

  dueDate?: string | null;

  projectId?: string | null;
  projectName?: string | null;

  goalId?: string | null;
  goalName?: string | null;

  score: number;

  reasons: string[];

  blocked?: boolean;
  overdue?: boolean;

  recommendedDate?: string | null;
  recommendedTime?: string | null;
};

type SmartTaskCardProps = {
  task: SmartTask;
  rank?: number;
};

function formatDate(date?: string | null) {
  if (!date) return "No deadline";

  return new Date(date).toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function SmartTaskCard({
  task,
  rank,
}: SmartTaskCardProps) {
  return (
    <article className="rounded-2xl border p-5 transition hover:shadow-sm">
      <div className="flex gap-4">
        {rank && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold">
            {rank}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                {task.title}
              </h3>

              {task.projectName && (
                <p className="mt-1 text-xs opacity-50">
                  Project: {task.projectName}
                </p>
              )}

              {task.goalName && (
                <p className="mt-1 text-xs opacity-50">
                  Goal: {task.goalName}
                </p>
              )}
            </div>

            <div className="rounded-full border px-3 py-1 text-xs font-semibold">
              Score {Math.round(task.score)}
            </div>
          </div>

          {task.description && (
            <p className="mt-3 text-sm opacity-60">
              {task.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {task.priority && (
              <span className="rounded-full border px-2.5 py-1 text-xs">
                {task.priority}
              </span>
            )}

            {task.status && (
              <span className="rounded-full border px-2.5 py-1 text-xs">
                {task.status.replace("_", " ")}
              </span>
            )}

            {task.overdue && (
              <span className="rounded-full border border-red-400 px-2.5 py-1 text-xs">
                Overdue
              </span>
            )}

            {task.blocked && (
              <span className="rounded-full border px-2.5 py-1 text-xs">
                Blocked
              </span>
            )}

            {task.dueDate && (
              <span className="rounded-full border px-2.5 py-1 text-xs">
                Due {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {task.recommendedDate && (
            <div className="mt-4 rounded-xl border border-dashed p-3">
              <p className="text-xs opacity-50">
                Recommended
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(task.recommendedDate)}

                {task.recommendedTime &&
                  ` · ${task.recommendedTime}`}
              </p>
            </div>
          )}

          {task.reasons.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide opacity-50">
                Why this task?
              </p>

              <ul className="space-y-1">
                {task.reasons.map(
                  (reason, index) => (
                    <li
                      key={index}
                      className="text-sm opacity-70"
                    >
                      • {reason}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}