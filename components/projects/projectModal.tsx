"use client";

import {
  Project,
} from "./projectModel";

import ProjectCreate from "./projectCreate";
import ProjectEdit from "./projectEdit";

type ProjectModalProps = {
  open: boolean;

  project?: Project | null;

  onClose: () => void;

  onCreated?: (
    project: Project
  ) => void;

  onUpdated?: (
    project: Project
  ) => void;
};

export default function ProjectModal({
  open,
  project,
  onClose,
  onCreated,
  onUpdated,
}: ProjectModalProps) {
  if (!open) {
    return null;
  }

  const editing =
    Boolean(project);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider opacity-50">
              Projects
            </p>

            <h2 className="text-xl font-semibold">
              {editing
                ? "Edit Project"
                : "Create Project"}
            </h2>

            <p className="mt-1 text-sm opacity-50">
              {editing
                ? "Update your project details."
                : "Set up a new project and start working toward the deadline."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        {editing ? (
          <ProjectEdit
            project={project!}
            onCancel={onClose}
            onUpdated={onUpdated}
          />
        ) : (
          <ProjectCreate
            onCancel={onClose}
            onCreated={onCreated}
          />
        )}
      </div>
    </div>
  );
}