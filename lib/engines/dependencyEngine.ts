// lib/engines/dependencyEngine.ts

export type DependencyTask = {
  id: string;
  title: string;

  status:
    | "TODO"
    | "IN_PROGRESS"
    | "BLOCKED"
    | "COMPLETED"
    | "CANCELLED";

  parentTaskId?: string | null;
};

export type DependencyResult = {
  taskId: string;

  blocked: boolean;

  blockers: string[];

  dependents: string[];

  depth: number;
};

export function buildDependencyMap(
  tasks: DependencyTask[]
) {
  const byId = new Map<
    string,
    DependencyTask
  >();

  for (const task of tasks) {
    byId.set(task.id, task);
  }

  const dependents =
    new Map<string, string[]>();

  for (const task of tasks) {
    if (!task.parentTaskId) {
      continue;
    }

    const existing =
      dependents.get(
        task.parentTaskId
      ) ?? [];

    existing.push(task.id);

    dependents.set(
      task.parentTaskId,
      existing
    );
  }

  return {
    byId,
    dependents,
  };
}

export function analyseDependencies(
  tasks: DependencyTask[]
): DependencyResult[] {
  const {
    byId,
    dependents,
  } =
    buildDependencyMap(tasks);

  return tasks.map((task) => {
    const blockers: string[] = [];

    let currentId =
      task.parentTaskId;

    let depth = 0;

    while (currentId) {
      const parent =
        byId.get(currentId);

      if (!parent) break;

      depth++;

      if (
        parent.status !==
        "COMPLETED"
      ) {
        blockers.push(
          parent.id
        );
      }

      currentId =
        parent.parentTaskId;
    }

    return {
      taskId: task.id,

      blocked:
        blockers.length > 0,

      blockers,

      dependents:
        dependents.get(task.id) ??
        [],

      depth,
    };
  });
}

export function getBlockingCount(
  taskId: string,
  tasks: DependencyTask[]
) {
  const {
    dependents,
  } =
    buildDependencyMap(tasks);

  return (
    dependents.get(taskId)
      ?.length ?? 0
  );
}

export function getAvailableTasks(
  tasks: DependencyTask[]
) {
  const dependencies =
    analyseDependencies(tasks);

  const availableIds =
    new Set(
      dependencies
        .filter(
          (dependency) =>
            !dependency.blocked
        )
        .map(
          (dependency) =>
            dependency.taskId
        )
    );

  return tasks.filter(
    (task) =>
      availableIds.has(task.id) &&
      task.status !==
        "COMPLETED" &&
      task.status !==
        "CANCELLED"
  );
}