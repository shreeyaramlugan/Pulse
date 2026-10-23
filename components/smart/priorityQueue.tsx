"use client";

import SmartTaskCard, {
  SmartTask,
} from "./smartTaskCard";

type PriorityQueueProps = {
  tasks: SmartTask[];
  loading?: boolean;
};

export default function PriorityQueue({
  tasks,
  loading = false,
}: PriorityQueueProps) {
  return (
    <section className="rounded-2xl border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Priority Queue
        </h2>

        <p className="mt-1 text-sm opacity-60">
          Tasks ranked by urgency, impact, deadlines,
          dependencies and goal alignment.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl border"
              />
            )
          )}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">
            No prioritised tasks
          </p>

          <p className="mt-1 text-sm opacity-60">
            Your workspace is currently clear.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <SmartTaskCard
              key={task.id}
              task={task}
              rank={index + 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}