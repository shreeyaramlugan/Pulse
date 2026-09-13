"use client";

import type { Project } from "./projectModel";

type ProjectCardProps = {
  project: Project;

  onOpen?: (project: Project) => void;

  onEdit?: (project: Project) => void;

  onDelete?: (projectId: string) => void;

  onToggle?: (project: Project) => void;
};

function formatDate(date: string | null) {
  if (!date) return "No deadline";

  return new Date(date).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPriorityLabel(priority: string) {
  return (
    priority.charAt(0) +
    priority.slice(1).toLowerCase()
  );
}

export default function ProjectCard({
  project,
  onOpen,
  onEdit,
  onDelete,
  onToggle,
}: ProjectCardProps) {
  const isCompleted = project.status === "COMPLETED";

  const overdue =
    project.dueDate &&
    new Date(project.dueDate) < new Date() &&
    !isCompleted;

  function handleOpen() {
    onOpen?.(project);
  }

  return (
    <article
      onClick={handleOpen}
      className="group cursor-pointer rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        {/* Complete toggle */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle?.(project);
          }}
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            isCompleted ? "opacity-100" : "opacity-60"
          }`}
          aria-label={
            isCompleted
              ? "Mark project active"
              : "Mark project complete"
          }
        >
          {isCompleted && (
            <span className="text-xs">✓</span>
          )}
        </button>

        {/* Project information */}
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold ${
              isCompleted
                ? "line-through opacity-50"
                : ""
            }`}
          >
            {project.name}
          </h3>

          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm opacity-60">
              {project.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex gap-1 opacity-0 transition group-hover:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="rounded-lg border px-2 py-1 text-xs transition hover:bg-black/5"
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(project.id)}
              className="rounded-lg border px-2 py-1 text-xs transition hover:bg-black/5"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border px-2.5 py-1 text-xs">
          {project.status.replaceAll("_", " ")}
        </span>

        <span className="rounded-full border px-2.5 py-1 text-xs">
          {getPriorityLabel(project.priority)}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs opacity-60">
          <span>Progress</span>

          <span>
            {project.progress.percentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full border">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${project.progress.percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs opacity-50">
            Steps
          </p>

          <p className="mt-1 font-medium">
            {project.progress.completed} /{" "}
            {project.progress.total}
          </p>
        </div>

        <div>
          <p className="text-xs opacity-50">
            Deadline
          </p>

          <p
            className={`mt-1 font-medium ${
              overdue ? "text-red-500" : ""
            }`}
          >
            {formatDate(project.dueDate)}
          </p>
        </div>
      </div>

      {/* Open button */}
      {onOpen && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleOpen();
          }}
          className="mt-5 w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-black/5"
        >
          Open Project
        </button>
      )}
    </article>
  );
}