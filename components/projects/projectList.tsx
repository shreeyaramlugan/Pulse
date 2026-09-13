"use client";

import ProjectCard from "./projectCard";
import type { Project } from "./projectModel";

type ProjectListProps = {
  projects: Project[];
  loading: boolean;
  onToggle: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onEdit: (project: Project) => void;
  onAddStep: (project: Project) => void;
  onView: (project: Project) => void;
};

export default function ProjectList({
  projects,
  loading,
  onToggle,
  onDelete,
  onEdit,
  onAddStep,
  onView,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl border"
          />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border text-xl">
          +
        </div>

        <h2 className="font-semibold">
          No projects found
        </h2>

        <p className="mt-2 text-sm opacity-60">
          Create your first project to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onView}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}