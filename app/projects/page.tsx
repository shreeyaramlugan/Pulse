"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ProjectSearch from "@/components/projects/projectSearch";
import ProjectFilters from "@/components/projects/projectFilters";
import ProjectList from "@/components/projects/projectList";
import ProjectKanban from "@/components/projects/projectKanban";
import ProjectAsana from "@/components/projects/projectAsana";
import ProjectModal from "@/components/projects/projectModal";

import type {
  Project,
  ProjectFilters as ProjectFilterType,
} from "@/components/projects/projectModel";

type ViewMode = "LIST" | "KANBAN" | "ASANA";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(
    []
  );

  const [search, setSearch] = useState("");

  const [filters, setFilters] =
    useState<ProjectFilterType>({
      status: "",
      priority: "",
      deadline: "",
    });

  const [view, setView] =
    useState<ViewMode>("LIST");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  /*
   * -------------------------------------------------------
   * Fetch projects
   * -------------------------------------------------------
   */

  const fetchProjects = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params =
          new URLSearchParams();

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (filters.status) {
          params.set(
            "status",
            filters.status
          );
        }

        if (filters.priority) {
          params.set(
            "priority",
            filters.priority
          );
        }

        if (filters.deadline) {
          params.set(
            "deadline",
            filters.deadline
          );
        }

        params.set(
          "page",
          String(page)
        );

        params.set(
          "limit",
          "50"
        );

        const response =
          await fetch(
            `/api/projects?${params.toString()}`,
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
              "Failed to load projects."
          );
        }

        setProjects(
          data.data || []
        );

        setPagination(
          data.pagination || {
            page: 1,
            limit: 50,
            total:
              data.data?.length || 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    [search, filters]
  );

  /*
   * -------------------------------------------------------
   * Initial fetch / search
   * -------------------------------------------------------
   */

  useEffect(() => {
    const timeout =
      setTimeout(() => {
        fetchProjects(1);
      }, 300);

    return () =>
      clearTimeout(timeout);
  }, [fetchProjects]);

  /*
   * -------------------------------------------------------
   * Filters
   * -------------------------------------------------------
   */

  function updateFilter(
    key: keyof ProjectFilterType,
    value: string
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearFilters() {
    setSearch("");

    setFilters({
      status: "",
      priority: "",
      deadline: "",
    });
  }

  const hasFilters =
    Boolean(search) ||
    Object.values(filters).some(
      Boolean
    );

  /*
   * -------------------------------------------------------
   * Create
   * -------------------------------------------------------
   */

  function openCreateModal() {
    setEditingProject(null);
    setModalOpen(true);
  }

  /*
   * -------------------------------------------------------
   * Edit
   * -------------------------------------------------------
   */

  function openEditModal(
    project: Project
  ) {
    setEditingProject(project);
    setModalOpen(true);
  }

  /*
   * -------------------------------------------------------
   * View project
   * -------------------------------------------------------
   */

  function viewProject(
    project: Project
  ) {
    window.location.href =
      `/projects/${project.id}`;
  }

  /*
   * -------------------------------------------------------
   * Add step
   * -------------------------------------------------------
   *
   * ProjectModal can also be used for this later.
   * For now we send the user to the project detail page,
   * where steps can be managed.
   */

  function addStep(
    project: Project
  ) {
    window.location.href =
      `/projects/${project.id}#steps`;
  }

  /*
   * -------------------------------------------------------
   * Toggle project
   * -------------------------------------------------------
   */

  async function toggleProject(
    project: Project
  ) {
    try {
      setError(null);

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

      setProjects(
        (current) =>
          current.map((item) =>
            item.id === project.id
              ? {
                  ...item,
                  ...data.data,
                }
              : item
          )
      );
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
   * Delete project
   * -------------------------------------------------------
   */

  async function deleteProject(
    projectId: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?"
      );

    if (!confirmed) return;

    try {
      setError(null);

      const response =
        await fetch(
          `/api/projects/${projectId}`,
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
            "Failed to delete project."
        );
      }

      setProjects(
        (current) =>
          current.filter(
            (project) =>
              project.id !== projectId
          )
      );

      setPagination(
        (current) => ({
          ...current,
          total: Math.max(
            current.total - 1,
            0
          ),
        })
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete project."
      );
    }
  }

  /*
   * -------------------------------------------------------
   * Render
   * -------------------------------------------------------
   */

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider opacity-60">
              Productivity
            </p>

            <h1 className="text-3xl font-bold">
              Projects
            </h1>

            <p className="mt-2 opacity-60">
              Turn your ideas into organised,
              actionable work.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl px-5 py-3 font-medium"
          >
            + New Project
          </button>
        </div>

        {/* Search */}

        <div className="mb-4">
          <ProjectSearch
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Filters */}

        <div className="mb-6">
          <ProjectFilters
            filters={filters}
            onChange={updateFilter}
            onClear={clearFilters}
            hasFilters={hasFilters}
          />
        </div>

        {/* View selector */}

        <div className="mb-6 flex items-center justify-between gap-4">

          {!loading && (
            <div className="text-sm opacity-60">
              {pagination.total}{" "}
              {pagination.total === 1
                ? "project"
                : "projects"}
            </div>
          )}

          <div className="ml-auto flex rounded-xl border p-1">

            <button
              type="button"
              onClick={() =>
                setView("LIST")
              }
              className={`rounded-lg px-3 py-2 text-sm ${
                view === "LIST"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "opacity-60"
              }`}
            >
              Cards
            </button>

            <button
              type="button"
              onClick={() =>
                setView("KANBAN")
              }
              className={`rounded-lg px-3 py-2 text-sm ${
                view === "KANBAN"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "opacity-60"
              }`}
            >
              Kanban
            </button>

            <button
              type="button"
              onClick={() =>
                setView("ASANA")
              }
              className={`rounded-lg px-3 py-2 text-sm ${
                view === "ASANA"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "opacity-60"
              }`}
            >
              Asana
            </button>

          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-300 p-4 text-sm">
            {error}
          </div>
        )}

        {/* Project views */}

        {view === "LIST" && (
          <ProjectList
            projects={projects}
            loading={loading}
            onToggle={toggleProject}
            onDelete={deleteProject}
            onEdit={openEditModal}
            onAddStep={addStep}
            onView={viewProject}
          />
        )}

        {view === "KANBAN" && (
          <ProjectKanban
            projects={projects}
            loading={loading}
            onToggle={toggleProject}
            onDelete={deleteProject}
            onEdit={openEditModal}
            onView={viewProject}
          />
        )}

        {view === "ASANA" && (
          <ProjectAsana
            projects={projects}
            loading={loading}
            onToggle={toggleProject}
            onDelete={deleteProject}
            onEdit={openEditModal}
            onView={viewProject}
          />
        )}

        {/* Pagination */}

        {!loading &&
          pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">

              <button
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  fetchProjects(
                    pagination.page - 1
                  )
                }
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm opacity-60">
                Page{" "}
                {pagination.page} of{" "}
                {pagination.totalPages}
              </span>

              <button
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  fetchProjects(
                    pagination.page + 1
                  )
                }
                className="rounded-lg border px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>

            </div>
          )}
      </div>

      {/* Create / Edit Modal */}

      <ProjectModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        project={editingProject}
        onCreated={() => {
          setModalOpen(false);
          fetchProjects(1);
        }}
        onUpdated={() => {
          setModalOpen(false);
          fetchProjects(
            pagination.page
          );
        }}
      />
    </main>
  );
}
