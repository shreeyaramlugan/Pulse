import GoalCard from "./goalCard";
import type { Goal } from "@/app/goals/page";

type GoalListProps = {
  goals: Goal[];
  loading: boolean;

  onToggle: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onEdit: (goal: Goal) => void;

  onAddSubGoal: (goal: Goal) => void;
  onToggleSubGoal: (goal: Goal) => void;
  onEditSubGoal: (goal: Goal) => void;
};

export default function GoalList({
  goals,
  loading,
  onToggle,
  onDelete,
  onEdit,
  onAddSubGoal,
  onToggleSubGoal,
  onEditSubGoal,
}: GoalListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl border"
          />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <h2 className="font-semibold">
          No goals found
        </h2>

        <p className="mt-2 text-sm opacity-60">
          Create your first goal to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onAddSubGoal={onAddSubGoal}
          onToggleSubGoal={onToggleSubGoal}
          onEditSubGoal={onEditSubGoal}
        />
      ))}
    </div>
  );
}