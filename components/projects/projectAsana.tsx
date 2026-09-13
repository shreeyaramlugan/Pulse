"use client";

import {
  Project,
} from "./projectModel";

type ProjectAsanaProps = {
  projects: Project[];

  onOpen?: (
    project: Project
  ) => void;

  onEdit?: (
    project: Project
  ) => void;

  onDelete?: (
    projectId: string
  ) => void;

  onToggle?: (
    project: Project
  ) => void;
};

function formatDate(
  date: string | null
) {
  if (!date) return "—";

  return new Date(
    date
  ).toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function ProjectAsana({
  projects,
  onOpen,
  onEdit,
  onDelete,
  onToggle,
}: ProjectAsanaProps) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      {/* Header */}
      <div className="hidden grid-cols-[2fr_120px_110px_120px_130px_150px] gap-4 border-b px-5 py-3 text-xs font-medium uppercase tracking-wider opacity-50 lg:grid">
        <span>
          Project
        </span>

        <span>
          Status
        </span>

        <span>
          Priority
        </span>

        <span>
          Progress
        </span>

        <span>
          Deadline
        </span>

        <span>
          Actions
        </span>
      </div>

      {/* Rows */}
      <div>
        {projects.map((project) => (
          <div
            key={project.id}
            className="grid gap-4 border-b px-5 py-4 last:border-b-0 lg:grid-cols-[2fr_120px_110px_120px_130px_150px] lg:items-center"
          >
            {/* Project */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() =>
                  onToggle?.(
                    project
                  )
                }
                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
              >
                {project.status ===
                  "COMPLETED" && (
                  <span className="text-xs">
                    ✓
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onOpen?.(project)
                }
                className="min-w-0 text-left"
              >
                <h3 className="font-medium">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="mt-1 line-clamp-1 text-sm opacity-50">
                    {
                      project.description
                    }
                  </p>
                )}
              </button>
            </div>

            {/* Status */}
            <div>
              <span className="rounded-full border px-2.5 py-1 text-xs">
                {project.status.replace(
                  "_",
                  " "
                )}
              </span>
            </div>

            {/* Priority */}
            <div className="text-sm">
              {project.priority}
            </div>

            {/* Progress */}
            <div>
              <div className="mb-1 flex justify-between text-xs opacity-60">
                <span>
                  {
                    project.progress
                      .completed
                  }
                  /
                  {
                    project.progress
                      .total
                  }
                </span>

                <span>
                  {
                    project.progress
                      .percentage
                  }%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full border">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${project.progress.percentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="text-sm">
              {formatDate(
                project.dueDate
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {onOpen && (
                <button
                  type="button"
                  onClick={() =>
                    onOpen(project)
                  }
                  className="rounded-lg border px-2.5 py-1.5 text-xs"
                >
                  Open
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={() =>
                    onEdit(project)
                  }
                  className="rounded-lg border px-2.5 py-1.5 text-xs"
                >
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() =>
                    onDelete(
                      project.id
                    )
                  }
                  className="rounded-lg border px-2.5 py-1.5 text-xs"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="p-12 text-center text-sm opacity-50">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
}