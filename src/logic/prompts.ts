import type { Task } from '@/types';

/**
 * Up to `limit` previous tasks that can act as templates for a new task:
 * case-insensitive substring match on the typed name, collapsed by name
 * (case-insensitive, the latest creation wins) and ordered latest-first.
 */
export function previousTaskPrompts(tasks: Task[], typedName: string, limit = 3): Task[] {
  const query = typedName.trim().toLowerCase();
  if (query.length === 0) return [];

  const byName = new Map<string, Task>();
  for (const task of tasks) {
    if (!task.name.toLowerCase().includes(query)) continue;
    const key = task.name.toLowerCase();
    const existing = byName.get(key);
    if (existing == null || task.createdAt > existing.createdAt) byName.set(key, task);
  }

  return [...byName.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}
