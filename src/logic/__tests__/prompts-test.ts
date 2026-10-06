import { previousTaskPrompts } from '../prompts';

import type { Task } from '@/types';

const NOW = 1_700_000_000_000;

function task(id: string, name: string, createdAt: number): Task {
  return {
    id,
    name,
    priority: 1,
    categoryId: null,
    plannedTimeMinutes: 30,
    granularityMinutes: 15,
    parentId: null,
    status: 'pending',
    description: null,
    timeEntries: [],
    createdAt,
    completedAt: null,
  };
}

describe('previousTaskPrompts', () => {
  const tasks = [
    task('t1', 'Write report', NOW - 3000),
    task('t2', 'Write emails', NOW - 2000),
    task('t3', 'Read book', NOW - 1000),
    task('t4', 'write report', NOW - 500),
  ];

  test('empty query returns no prompts', () => {
    expect(previousTaskPrompts(tasks, '')).toEqual([]);
    expect(previousTaskPrompts(tasks, '   ')).toEqual([]);
  });

  test('matches substring case-insensitively, duplicates collapse to the latest', () => {
    const prompts = previousTaskPrompts(tasks, 'WRIT');
    expect(prompts.map((t) => t.id)).toEqual(['t4', 't2']);
  });

  test('duplicates differing only by case collapse to the latest', () => {
    const prompts = previousTaskPrompts(tasks, 'write report');
    expect(prompts).toHaveLength(1);
    expect(prompts[0].id).toBe('t4');
    expect(prompts[0].createdAt).toBe(NOW - 500);
  });

  test('caps at 3, latest first', () => {
    const many = Array.from({ length: 5 }, (_, i) => task(`x${i}`, `task ${i}`, NOW + i));
    const prompts = previousTaskPrompts(many, 'task', 3);
    expect(prompts).toHaveLength(3);
    expect(prompts.map((t) => t.id)).toEqual(['x4', 'x3', 'x2']);
  });

  test('no match returns nothing', () => {
    expect(previousTaskPrompts(tasks, 'zzz')).toEqual([]);
  });
});
