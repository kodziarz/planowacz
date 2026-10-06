export type TaskStatus = 'pending' | 'inProgress' | 'done' | 'cancelled';

export const TASK_STATUSES: TaskStatus[] = ['pending', 'inProgress', 'done', 'cancelled'];

/** A single manual time-log entry added to a task or subtask. */
export interface TimeEntry {
  id: string;
  minutes: number;
  /** When the time was logged (ms since epoch). Drives statistics date ranges. */
  at: number;
}

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
  /** Optional free-text description. */
  description: string | null;
  /** Manually logged time (newest last). */
  timeEntries: TimeEntry[];
  createdAt: number;
  /** Set when status becomes 'done', cleared otherwise. Drives the coefficient history. */
  completedAt: number | null;
}

export interface Situation {
  id: string;
  name: string;
  /** Optional free-text description. */
  description: string | null;
  /** Optional free-text localization label (address as typed by the user). */
  localization: string | null;
  /** Coordinates resolved from the localization; null when unknown/failed. */
  latitude: number | null;
  longitude: number | null;
  createdAt: number;
}

export interface Note {
  id: string;
  situationId: string;
  name: string;
  /** Optional free-text description. */
  description: string | null;
  createdAt: number;
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
  situations: Situation[];
  notes: Note[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  priorityCoefficient: 0.5,
  priorityReferencePeriodDays: 7,
  language: 'system',
};
