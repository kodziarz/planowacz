import { MIN_TIME_MINUTES, roundToTimeStep } from '@/constants/time';
import type { Task } from '@/types';

/**
 * Remaining planned time of a parent for assigning to a new/existing subtask.
 * When `excludeTaskId` is given (editing an existing subtask), that task's own
 * planned time is not counted as used, so the slider max includes it back.
 */
export function remainingParentTime(
  parent: Task,
  tasks: Task[],
  excludeTaskId?: string,
): number | null {
  if (parent.plannedTimeMinutes == null) return null;
  const used = tasks
    .filter((task) => task.parentId === parent.id && task.id !== excludeTaskId)
    .reduce((sum, task) => sum + (task.plannedTimeMinutes ?? 0), 0);
  return Math.max(0, parent.plannedTimeMinutes - used);
}

/**
 * Default planned time for a subtask: the remaining time from the parent,
 * rounded to the 5-minute UI step. Null when the parent has no planned time
 * or nothing (≥ 5 min) remains.
 */
export function defaultPlannedTimeForSubtask(
  parent: Task,
  tasks: Task[],
  excludeTaskId?: string,
): number | null {
  const remaining = remainingParentTime(parent, tasks, excludeTaskId);
  if (remaining == null) return null;
  if (remaining < MIN_TIME_MINUTES) return null;
  return roundToTimeStep(remaining);
}

/** Default granularity for a subtask is the granularity of the parent task. */
export function defaultGranularityForSubtask(parent: Task): number | null {
  return parent.granularityMinutes;
}

/** True when the task has no subtasks (any depth). */
export function isLeafTask(tasks: Task[], taskId: string): boolean {
  return !tasks.some((task) => task.parentId === taskId);
}

export function childTasks(tasks: Task[], parentId: string): Task[] {
  return tasks
    .filter((task) => task.parentId === parentId)
    .sort((a, b) => a.createdAt - b.createdAt);
}
