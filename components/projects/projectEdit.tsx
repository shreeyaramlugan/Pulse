"use client";

import { FormEvent, useState } from "react";

import {
  Project,
  ProjectPriority,
  ProjectStatus,
  UpdateProjectInput,
} from "./projectModel";

type ProjectEditProps = {
  project: Project;

  onUpdated?: (project: Project) => void;

  onCancel?: () => void;
};

export default function ProjectEdit({
  project,
  onUpdated,
  onCancel,
}: ProjectEditProps) {
  const [name, setName] =
    useState(project.name);

  const [description, setDescription] =
    useState(project.description || "");

  const [status, setStatus] =
    useState<ProjectStatus>(
      project.status
    );

  const [priority, setPriority] =
    useState<ProjectPriority>(
      project.priority
    );

  const [startDate, setStartDate] =
    useState(
      project.startDate
        ? project.startDate.slice(0, 10)
        : ""
    );

  const [dueDate, setDueDate] =
    useState(
      project.dueDate
        ? project.dueDate.slice(0, 10)
        : ""
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Project name is required."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: UpdateProjectInput = {
        name: name.trim(),

        description:
          description.trim() || null,

        status,
        priority,

        startDate:
          startDate || null,

        dueDate:
          dueDate || null,
      };

      const response = await fetch(
        `/api/projects/${project.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify(payload),
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

      onUpdated?.(data.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update project."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Project name
        </label>

        <input
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          rows={4}
          className="w-full resize-none rounded-xl border bg-transparent px-4 py-3 outline-none focus:ring-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Status
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target
                  .value as ProjectStatus
              )
            }
            className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
          >
            <option value="PLANNING">
              Planning
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="ON_HOLD">
              On hold
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

            <option value="ARCHIVED">
              Archived
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Priority
          </label>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target
                  .value as ProjectPriority
              )
            }
            className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
          >
            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="URGENT">
              Urgent
            </option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Start date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(
                event.target.value
              )
            }
            className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Deadline
          </label>

          <input
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(
                event.target.value
              )
            }
            className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-4 py-2.5 text-sm"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}