import { buildQueues } from '../queues';

import type { Task } from '@/types';

const NOW = 1_700_000_000_000;

function task(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    name: overrides.id,
    priority: 1,
    categoryId: null,
    plannedTimeMinutes: null,
    granularityMinutes: null,
    parentId: null,
    status: 'pending',
    createdAt: NOW,
    completedAt: null,
    ...overrides,
  };
}

describe('buildQueues', () => {
  const tasks = [
    task({ id: 'a', priority: 2, plannedTimeMinutes: 30, createdAt: NOW - 3000, status: 'pending' }),
    task({ id: 'b', priority: 1, plannedTimeMinutes: 15, createdAt: NOW - 2000, status: 'inProgress' }),
    task({ id: 'c', priority: 1, plannedTimeMinutes: null, createdAt: NOW - 1000, status: 'pending' }),
    task({ id: 'd', priority: 1, status: 'done', completedAt: NOW }),
    task({ id: 'e', priority: 3, status: 'cancelled' }),
  ];

  test('groups active tasks by priority, ascending', () => {
    const queues = buildQueues(tasks);
    expect(queues.map((q) => q.priority)).toEqual([1, 2]);
  });

  test('counts pending + in progress, excludes done/cancelled', () => {
    const q1 = buildQueues(tasks).find((q) => q.priority === 1)!;
    expect(q1.count).toBe(2);
    expect(q1.inProgressCount).toBe(1);
  });

  test('aggregates planned time (null counts as 0)', () => {
    const q1 = buildQueues(tasks).find((q) => q.priority === 1)!;
    expect(q1.totalPlannedMinutes).toBe(15);
  });

  test('tasks ordered by creation time, older first', () => {
    const q1 = buildQueues(tasks).find((q) => q.priority === 1)!;
    expect(q1.tasks.map((t) => t.id)).toEqual(['b', 'c']);
  });
});
