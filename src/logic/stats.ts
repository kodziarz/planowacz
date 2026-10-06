import type { Task } from '@/types';

export interface CategorySpent {
  /** null = tasks without a category. */
  categoryId: string | null;
  minutes: number;
}

/**
 * Sums logged time entries whose timestamp falls within [startMs, endMs],
 * grouped by the task's category. Sorted by minutes descending.
 */
export function spentMinutesByCategory(
  tasks: Task[],
  startMs: number,
  endMs: number,
): CategorySpent[] {
  const totals = new Map<string, number>();
  for (const task of tasks) {
    for (const entry of task.timeEntries) {
      if (entry.at < startMs || entry.at > endMs) continue;
      const key = task.categoryId ?? '';
      totals.set(key, (totals.get(key) ?? 0) + entry.minutes);
    }
  }
  return [...totals.entries()]
    .map(([categoryId, minutes]) => ({ categoryId: categoryId === '' ? null : categoryId, minutes }))
    .sort((a, b) => b.minutes - a.minutes || String(a.categoryId).localeCompare(String(b.categoryId)));
}
