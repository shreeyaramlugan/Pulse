"use client";

import type { Task } from "./taskPage";
import TaskCard from "./taskCard";

type Props = {
  tasks: Task[];
  loading: boolean;

  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export default function TaskList({
  tasks,
  loading,
  onToggle,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border"
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border p-12 text-center">
        <div className="mb-3 text-4xl">
          ☕
        </div>

        <h2 className="text-lg font-semibold">
          No tasks found
        </h2>

        <p className="mt-2 text-sm opacity-60">
          Try changing your search or filters,
          or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}