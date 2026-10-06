import {
  defaultGranularityForSubtask,
  defaultPlannedTimeForSubtask,
  isLeafTask,
  remainingParentTime,
} from '../remaining';

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

describe('remainingParentTime', () => {
  const parent = task({ id: 'p', plannedTimeMinutes: 60 });

  test('null when parent has no planned time', () => {
    expect(remainingParentTime(task({ id: 'p2', plannedTimeMinutes: null }), [])).toBeNull();
  });

  test('subtracts planned time of existing children', () => {
    const children = [
      task({ id: 'c1', parentId: 'p', plannedTimeMinutes: 25 }),
      task({ id: 'c2', parentId: 'p', plannedTimeMinutes: null }),
    ];
    expect(remainingParentTime(parent, children)).toBe(35);
  });

  test('editing a subtask excludes its own planned time from "used"', () => {
    const children = [
      task({ id: 'c1', parentId: 'p', plannedTimeMinutes: 25 }),
      task({ id: 'c2', parentId: 'p', plannedTimeMinutes: 20 }),
    ];
    expect(remainingParentTime(parent, children, 'c2')).toBe(35);
  });

  test('never goes below zero', () => {
    const children = [task({ id: 'c1', parentId: 'p', plannedTimeMinutes: 100 })];
    expect(remainingParentTime(parent, children)).toBe(0);
  });
});

describe('defaultPlannedTimeForSubtask', () => {
  test('defaults to the parent remaining time', () => {
    const parent = task({ id: 'p', plannedTimeMinutes: 45 });
    expect(defaultPlannedTimeForSubtask(parent, [])).toBe(45);
  });

  test('null when parent has no planned time', () => {
    expect(defaultPlannedTimeForSubtask(task({ id: 'p' }), [])).toBeNull();
  });

  test('null when nothing (≥ 5 min) remains', () => {
    const parent = task({ id: 'p', plannedTimeMinutes: 10 });
    const children = [task({ id: 'c', parentId: 'p', plannedTimeMinutes: 10 })];
    expect(defaultPlannedTimeForSubtask(parent, children)).toBeNull();
  });
});

describe('defaultGranularityForSubtask', () => {
  test('inherits the parent granularity', () => {
    expect(defaultGranularityForSubtask(task({ id: 'p', granularityMinutes: 15 }))).toBe(15);
  });
  test('null when parent has none', () => {
    expect(defaultGranularityForSubtask(task({ id: 'p' }))).toBeNull();
  });
});

describe('isLeafTask', () => {
  test('true only without subtasks', () => {
    const tasks = [task({ id: 'p' }), task({ id: 'c', parentId: 'p' })];
    expect(isLeafTask(tasks, 'c')).toBe(true);
    expect(isLeafTask(tasks, 'p')).toBe(false);
    expect(isLeafTask(tasks, 'unknown')).toBe(true);
  });
});
