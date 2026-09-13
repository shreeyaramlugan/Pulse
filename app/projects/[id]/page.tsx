"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import ProjectEdit from "@/components/projects/projectEdit";

import type {
  Project,
  ProjectStep,
} from "@/components/projects/projectModel";

export default function ProjectDetailPage() {
  const params = useParams();

  const projectId =
    params.id as string;

  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [editOpen, setEditOpen] =
    useState(false);

  const [newStepTitle, setNewStepTitle] =
    useState("");

  const [addingStep, setAddingStep] =
    useState(false);

  /*
   * -------------------------------------------------------
   * Fetch project
   * -------------------------------------------------------
   */

  const fetchProject =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            `/api/projects/${projectId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load project."
          );
        }

        setProject(data.data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  /*
   * -------------------------------------------------------
   * Toggle project
   * -------------------------------------------------------
   */

  async function toggleProject() {
    if (!project) return;

    try {
      const newStatus =
        project.status === "COMPLETED"
          ? "ACTIVE"
          : "COMPLETED";

      const response =
        await fetch(
          `/api/projects/${project.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              status: newStatus,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update project."
        );
      }

      setProject(data.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update project."
      );
    }
  }

  /*
   * -------------------------------------------------------
   * Add step
   * -------------------------------------------------------
   */

  async function addStep() {
    if (
      !project ||
      !newStepTitle.trim()
    ) {
      return;
    }

    try {
      setAddingStep(true);
      setError(null);

      const response =
        await fetch(
          `/api/projects/${project.id}/steps`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              title:
                newStepTitle.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add step."
        );
      }

      setNewStepTitle("");

      await fetchProject();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add step."
      );
    } finally {
      setAddingStep(false);
    }
  }

  /*
   * -------------------------------------------------------
   * Toggle step
   * -------------------------------------------------------
   */

  async function toggleStep(
    step: ProjectStep
  ) {
    if (!project) return;

    try {
      const newStatus =
        step.status === "COMPLETED"
          ? "TODO"
          : "COMPLETED";

      const response =
        await fetch(
          `/api/projects/${project.id}/steps`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              stepId: step.id,
              status: newStatus,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update step."
        );
      }

      await fetchProject();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update step."
      );
    }
  }

  /*
   * -------------------------------------------------------
   * Delete step
   * -------------------------------------------------------
   */

  async function deleteStep(
    stepId: string
  ) {
    if (!project) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this step?"
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `/api/projects/${project.id}/steps?stepId=${stepId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete step."
        );
      }

      await fetchProject();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete step."
      );
    }
  }

  /*
   * -------------------------------------------------------
   * Loading
   * -------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-10 w-64 animate-pulse rounded-xl border" />

          <div className="mt-6 h-48 animate-pulse rounded-2xl border" />

          <div className="mt-6 h-80 animate-pulse rounded-2xl border" />
        </div>
      </main>
    );
  }

  /*
   * -------------------------------------------------------
   * Error / not found
   * -------------------------------------------------------
   */

  if (!project) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border p-8">
            <h1 className="text-xl font-semibold">
              Project not found
            </h1>

            <p className="mt-2 text-sm opacity-60">
              {error ||
                "This project could not be loaded."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * -------------------------------------------------------
   * Progress
   * -------------------------------------------------------
   */

  const progress =
    project.progress?.percentage ?? 0;

  const completedSteps =
    project.progress?.completed ?? 0;

  const totalSteps =
    project.progress?.total ?? 0;

  /*
   * -------------------------------------------------------
   * Render
   * -------------------------------------------------------
   */

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}

        <button
          type="button"
          onClick={() =>
            window.location.href =
              "/projects"
          }
          className="mb-6 text-sm opacity-60 hover:opacity-100"
        >
          ← Back to Projects
        </button>

        {/* Header */}

        <div className="mb-8 flex items-start justify-between gap-4">

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">

              <span className="rounded-full border px-3 py-1 text-xs">
                {project.status.replace(
                  "_",
                  " "
                )}
              </span>

              <span className="rounded-full border px-3 py-1 text-xs">
                {project.priority}
              </span>

            </div>

            <h1 className="text-3xl font-bold">
              {project.name}
            </h1>

            {project.description && (
              <p className="mt-3 max-w-2xl opacity-60">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={() =>
                setEditOpen(true)
              }
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={toggleProject}
              className="rounded-xl px-4 py-2 text-sm font-medium"
            >
              {project.status ===
              "COMPLETED"
                ? "Reopen"
                : "Mark Complete"}
            </button>

          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-300 p-4 text-sm">
            {error}
          </div>
        )}

        {/* Project overview */}

        <section className="mb-6 rounded-2xl border p-6">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="font-semibold">
                Project Progress
              </h2>

              <p className="mt-1 text-sm opacity-60">
                {completedSteps} of{" "}
                {totalSteps} steps completed
              </p>
            </div>

            <span className="text-2xl font-bold">
              {progress}%
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full border">
            <div
              className="h-full rounded-full bg-current transition-all"
              style={{
                width: `${Math.min(
                  Math.max(progress, 0),
                  100
                )}%`,
              }}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                Start date
              </p>

              <p className="mt-1 text-sm">
                {project.startDate
                  ? new Date(
                      project.startDate
                    ).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                Deadline
              </p>

              <p className="mt-1 text-sm">
                {project.dueDate
                  ? new Date(
                      project.dueDate
                    ).toLocaleDateString()
                  : "No deadline"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                Tasks
              </p>

              <p className="mt-1 text-sm">
                {project._count?.tasks ??
                  0}
              </p>
            </div>

          </div>
        </section>

        {/* Steps */}

        <section
          id="steps"
          className="rounded-2xl border p-6"
        >

          <div className="mb-6 flex items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-semibold">
                Steps
              </h2>

              <p className="mt-1 text-sm opacity-60">
                Break the project into
                manageable pieces.
              </p>
            </div>

          </div>

          {/* Add step */}

          <div className="mb-6 flex gap-2">

            <input
              type="text"
              value={newStepTitle}
              onChange={(event) =>
                setNewStepTitle(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  addStep();
                }
              }}
              placeholder="Add a project step..."
              className="min-w-0 flex-1 rounded-xl border bg-transparent px-4 py-3 outline-none"
            />

            <button
              type="button"
              onClick={addStep}
              disabled={
                addingStep ||
                !newStepTitle.trim()
              }
              className="rounded-xl px-5 py-3 font-medium disabled:opacity-40"
            >
              {addingStep
                ? "Adding..."
                : "Add Step"}
            </button>

          </div>

          {/* Steps */}

          {project.steps.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">

              <p className="font-medium">
                No steps yet
              </p>

              <p className="mt-1 text-sm opacity-60">
                Add your first step above.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {project.steps.map(
                (step) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-4 rounded-xl border p-4"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        toggleStep(step)
                      }
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                        step.status ===
                        "COMPLETED"
                          ? "bg-current text-white"
                          : ""
                      }`}
                      aria-label={
                        step.status ===
                        "COMPLETED"
                          ? "Mark incomplete"
                          : "Mark complete"
                      }
                    >
                      {step.status ===
                      "COMPLETED"
                        ? "✓"
                        : ""}
                    </button>

                    <div className="min-w-0 flex-1">

                      <p
                        className={`font-medium ${
                          step.status ===
                          "COMPLETED"
                            ? "line-through opacity-50"
                            : ""
                        }`}
                      >
                        {step.title}
                      </p>

                      {step.description && (
                        <p className="mt-1 text-sm opacity-60">
                          {
                            step.description
                          }
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-2">

                        <span className="rounded-full border px-2 py-1 text-xs">
                          {step.status.replace(
                            "_",
                            " "
                          )}
                        </span>

                        <span className="rounded-full border px-2 py-1 text-xs">
                          {step.priority}
                        </span>

                        {step.dueDate && (
                          <span className="rounded-full border px-2 py-1 text-xs">
                            Due{" "}
                            {new Date(
                              step.dueDate
                            ).toLocaleDateString()}
                          </span>
                        )}

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteStep(
                          step.id
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-xs opacity-60 hover:opacity-100"
                    >
                      Delete
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </section>
      </div>

      {/* Edit project */}

      {editOpen && (
        <ProjectEdit
          project={project}
          open={editOpen}
          onClose={() =>
            setEditOpen(false)
          }
          onUpdated={() => {
            setEditOpen(false);
            fetchProject();
          }}
        />
      )}

    </main>
  );
}

