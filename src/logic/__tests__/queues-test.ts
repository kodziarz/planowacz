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
    description: null,
    timeEntries: [],
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

describe('non-leaf visibility', () => {
  test('active parent with an active descendant is hidden, the leaf stays', () => {
    const list = [
      task({ id: 'p', priority: 1 }),
      task({ id: 'c', priority: 1, parentId: 'p', status: 'inProgress' }),
    ];
    const queued = buildQueues(list).flatMap((q) => q.tasks.map((t) => t.id));
    expect(queued).toEqual(['c']);
  });

  test('active parent with all descendants done/cancelled is shown', () => {
    const list = [
      task({ id: 'p', priority: 1 }),
      task({ id: 'c1', priority: 1, parentId: 'p', status: 'done', completedAt: NOW }),
      task({ id: 'c2', priority: 1, parentId: 'p', status: 'cancelled' }),
      task({ id: 'gc', priority: 1, parentId: 'c1', status: 'done', completedAt: NOW }),
    ];
    const queued = buildQueues(list).flatMap((q) => q.tasks.map((t) => t.id));
    expect(queued).toEqual(['p']);
  });

  test('active parent with a single pending grandchild is hidden', () => {
    const list = [
      task({ id: 'p', priority: 1 }),
      task({ id: 'mid', priority: 1, parentId: 'p', status: 'done', completedAt: NOW }),
      task({ id: 'leaf', priority: 1, parentId: 'mid', status: 'pending' }),
    ];
    const queued = buildQueues(list).flatMap((q) => q.tasks.map((t) => t.id));
    expect(queued).toEqual(['leaf']);
  });

  test('done parent with a pending child queues only the child', () => {
    const list = [
      task({ id: 'p', priority: 1, status: 'done', completedAt: NOW }),
      task({ id: 'c', priority: 1, parentId: 'p', status: 'pending' }),
    ];
    const queued = buildQueues(list).flatMap((q) => q.tasks.map((t) => t.id));
    expect(queued).toEqual(['c']);
  });
});
