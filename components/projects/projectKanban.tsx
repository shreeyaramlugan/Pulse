"use client";

import {
  Project,
  ProjectStatus,
} from "./projectModel";

type ProjectKanbanProps = {
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

const columns: {
  status: ProjectStatus;
  title: string;
}[] = [
  {
    status: "PLANNING",
    title: "Planning",
  },
  {
    status: "ACTIVE",
    title: "Active",
  },
  {
    status: "ON_HOLD",
    title: "On Hold",
  },
  {
    status: "COMPLETED",
    title: "Completed",
  },
];

function formatDate(
  date: string | null
) {
  if (!date) return "No deadline";

  return new Date(
    date
  ).toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

export default function ProjectKanban({
  projects,
  onOpen,
  onEdit,
  onDelete,
  onToggle,
}: ProjectKanbanProps) {
  return (
    <div className="grid min-w-[900px] grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnProjects =
          projects.filter(
            (project) =>
              project.status ===
              column.status
          );

        return (
          <section
            key={column.status}
            className="min-h-[500px] rounded-2xl border p-3"
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 className="font-semibold">
                {column.title}
              </h2>

              <span className="rounded-full border px-2 py-0.5 text-xs opacity-60">
                {columnProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {columnProjects.map(
                (project) => (
                  <article
                    key={project.id}
                    className="rounded-xl border p-4"
                  >
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
                          onOpen?.(
                            project
                          )
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <h3 className="font-medium">
                          {
                            project.name
                          }
                        </h3>

                        {project.description && (
                          <p className="mt-1 line-clamp-2 text-xs opacity-60">
                            {
                              project.description
                            }
                          </p>
                        )}
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs opacity-60">
                        <span>
                          {
                            project.progress
                              .completed
                          }{" "}
                          /{" "}
                          {
                            project.progress
                              .total
                          }{" "}
                          steps
                        </span>

                        <span>
                          {
                            project.progress
                              .percentage
                          }
                          %
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

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="opacity-50">
                        {formatDate(
                          project.dueDate
                        )}
                      </span>

                      <div className="flex gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(
                                project
                              )
                            }
                            className="rounded-md border px-2 py-1"
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
                            className="rounded-md border px-2 py-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}

              {columnProjects.length ===
                0 && (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm opacity-50">
                  No projects
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}