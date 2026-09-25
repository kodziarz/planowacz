export type TaskStatus = 'pending' | 'inProgress' | 'done' | 'cancelled';

export const TASK_STATUSES: TaskStatus[] = ['pending', 'inProgress', 'done', 'cancelled'];

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Task {
  id: string;
  name: string;
  /** 1 = highest priority, any positive integer. */
  priority: number;
  categoryId: string | null;
  /** Minutes, multiple of 5. Required for leaf tasks; optional default source for parents. */
  plannedTimeMinutes: number | null;
  /** Minutes, multiple of 5. Required for leaf tasks; optional default for subtasks. */
  granularityMinutes: number | null;
  parentId: string | null;
  status: TaskStatus;
  createdAt: number;
  /** Set when status becomes 'done', cleared otherwise. Drives the coefficient history. */
  completedAt: number | null;
}

export type LanguageSetting = 'system' | 'en' | 'pl';

export interface Settings {
  /** Share in (0, 1], UI step 0.05. */
  priorityCoefficient: number;
  priorityReferencePeriodDays: number;
  language: LanguageSetting;
}

export interface AppData {
  tasks: Task[];
  categories: Category[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  priorityCoefficient: 0.5,
  priorityReferencePeriodDays: 7,
  language: 'system',
};
