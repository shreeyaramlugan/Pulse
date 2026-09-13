// components/projects/projectModel.tsx

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export type ProjectPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type ProjectStepStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export type ProjectStepPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type ProjectStep = {
  id: string;
  title: string;
  description: string | null;

  status: ProjectStepStatus;
  priority: ProjectStepPriority;

  dueDate: string | null;

  estimatedMinutes: number | null;
  actualMinutes: number | null;

  completedAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;

  userId: string;

  clientId: string | null;

  name: string;
  description: string | null;

  status: ProjectStatus;
  priority: ProjectPriority;

  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;

  createdAt: string;
  updatedAt: string;

  steps: ProjectStep[];

  _count: {
    tasks: number;
  };

  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
};

export type ProjectFilters = {
  status: string;
  priority: string;
  deadline: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string | null;

  clientId?: string | null;

  status?: ProjectStatus;
  priority?: ProjectPriority;

  startDate?: string | null;
  dueDate?: string | null;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;

  clientId?: string | null;

  status?: ProjectStatus;
  priority?: ProjectPriority;

  startDate?: string | null;
  dueDate?: string | null;
};

export type CreateProjectStepInput = {
  title: string;
  description?: string | null;

  status?: ProjectStepStatus;
  priority?: ProjectStepPriority;

  dueDate?: string | null;

  estimatedMinutes?: number | null;
};

export type UpdateProjectStepInput = {
  title?: string;
  description?: string | null;

  status?: ProjectStepStatus;
  priority?: ProjectStepPriority;

  dueDate?: string | null;

  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
};