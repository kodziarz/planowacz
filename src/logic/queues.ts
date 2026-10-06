import { isActiveStatus } from './proposal';

import type { Task } from '@/types';

export interface PriorityQueue {
  priority: number;
  /** Tasks waiting in the queue: pending + in progress. */
  count: number;
  inProgressCount: number;
  /** Aggregate planned time of the tasks in the queue (null planned time counts as 0). */
  totalPlannedMinutes: number;
  /** Ordered by creation time, older first. */
  tasks: Task[];
}

/**
 * True when every descendant of the task is done or cancelled (vacuously true
 * for leaves). Active leaf tasks are therefore always queued, while active
 * parents are queued only when all their descendants are finished — otherwise
 * their work is represented by the queued descendants instead.
 */
export function allDescendantsTerminal(tasks: Task[], id: string): boolean {
  let frontier = [id];
  const seen = new Set<string>([id]);
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const task of tasks) {
      if (task.parentId == null || !frontier.includes(task.parentId) || seen.has(task.id)) continue;
      seen.add(task.id);
      if (task.status !== 'done' && task.status !== 'cancelled') return false;
      next.push(task.id);
    }
    frontier = next;
  }
  return true;
}

/**
 * Queues are sets of active tasks (pending + in progress) grouped by priority.
 * Displayed ascending (1 = highest first); tasks within a queue by creation time.
 */
export function buildQueues(tasks: Task[]): PriorityQueue[] {
  const active = tasks.filter(
    (task) => isActiveStatus(task.status) && allDescendantsTerminal(tasks, task.id),
  );
  const byPriority = new Map<number, Task[]>();
  for (const task of active) {
    const list = byPriority.get(task.priority);
    if (list) list.push(task);
    else byPriority.set(task.priority, [task]);
  }

  return [...byPriority.entries()]
    .map(([priority, list]) => {
      const sorted = [...list].sort((a, b) => a.createdAt - b.createdAt);
      return {
        priority,
        count: sorted.length,
        inProgressCount: sorted.filter((task) => task.status === 'inProgress').length,
        totalPlannedMinutes: sorted.reduce((sum, task) => sum + (task.plannedTimeMinutes ?? 0), 0),
        tasks: sorted,
      };
    })
    .sort((a, b) => a.priority - b.priority);
}
