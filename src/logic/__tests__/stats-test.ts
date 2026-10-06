import { spentMinutesByCategory } from '../stats';

import type { Task } from '@/types';

const NOW = 1_700_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

function task(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    name: overrides.id,
    priority: 1,
    categoryId: null,
    plannedTimeMinutes: 30,
    granularityMinutes: 15,
    parentId: null,
    status: 'pending',
    description: null,
    timeEntries: [],
    createdAt: NOW,
    completedAt: null,
    ...overrides,
  };
}

describe('spentMinutesByCategory', () => {
  const start = NOW - 7 * DAY;
  const end = NOW;

  test('groups entries by category within the period', () => {
    const tasks = [
      task({ id: 'a', categoryId: 'c1', timeEntries: [
        { id: 'e1', minutes: 30, at: NOW - 2 * DAY },
        { id: 'e2', minutes: 15, at: NOW - DAY },
      ] }),
      task({ id: 'b', categoryId: 'c1', timeEntries: [{ id: 'e3', minutes: 15, at: NOW - 3 * DAY }] }),
      task({ id: 'c', categoryId: 'c2', timeEntries: [{ id: 'e4', minutes: 75, at: NOW - DAY }] }),
    ];
    expect(spentMinutesByCategory(tasks, start, end)).toEqual([
      { categoryId: 'c2', minutes: 75 },
      { categoryId: 'c1', minutes: 60 },
    ]);
  });

  test('excludes entries outside the period', () => {
    const tasks = [
      task({ id: 'a', categoryId: 'c1', timeEntries: [
        { id: 'old', minutes: 100, at: NOW - 30 * DAY },
        { id: 'new', minutes: 10, at: NOW - DAY },
      ] }),
    ];
    expect(spentMinutesByCategory(tasks, start, end)).toEqual([
      { categoryId: 'c1', minutes: 10 },
    ]);
  });

  test('uncategorized tasks land in the null bucket', () => {
    const tasks = [task({ id: 'a', categoryId: null, timeEntries: [{ id: 'e', minutes: 20, at: NOW }] })];
    expect(spentMinutesByCategory(tasks, start, end)).toEqual([
      { categoryId: null, minutes: 20 },
    ]);
  });

  test('empty when no entries fall in the period', () => {
    expect(spentMinutesByCategory([task({ id: 'a' })], start, end)).toEqual([]);
  });
});
