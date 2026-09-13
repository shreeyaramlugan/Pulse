"use client";

import { FormEvent, useState } from "react";
import {
  CreateProjectInput,
  ProjectPriority,
  ProjectStatus,
} from "./projectModel";

type ProjectCreateProps = {
  onCreated?: (project: any) => void;
  onCancel?: () => void;
};

export default function ProjectCreate({
  onCreated,
  onCancel,
}: ProjectCreateProps) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<ProjectStatus>("PLANNING");

  const [priority, setPriority] =
    useState<ProjectPriority>("MEDIUM");

  const [startDate, setStartDate] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

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

      const payload: CreateProjectInput = {
        name: name.trim(),
        description:
          description.trim() || null,
        status,
        priority,
        startDate: startDate || null,
        dueDate: dueDate || null,
      };

      const response = await fetch(
        "/api/projects",
        {
          method: "POST",
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
            "Failed to create project."
        );
      }

      onCreated?.(data.data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create project."
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
          placeholder="e.g. Pulse Dashboard"
          className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:ring-2"
          autoFocus
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
          placeholder="What are you building?"
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

      <div className="flex justify-end gap-3 pt-2">
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
            ? "Creating..."
            : "Create Project"}
        </button>
      </div>
    </form>
  );
}