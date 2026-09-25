import {
  granularityViolation,
  priorityViolation,
  proposalCandidates,
  rankProposals,
  violationPoints,
  type ProposalContext,
} from '../proposal';

import type { Task } from '@/types';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = 1_700_000_000_000;

function task(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    name: overrides.id,
    priority: 1,
    categoryId: null,
    plannedTimeMinutes: 30,
    granularityMinutes: 15,
    parentId: null,
    status: 'pending',
    createdAt: NOW - HOUR,
    completedAt: null,
    ...overrides,
  };
}

function ctx(tasks: Task[], overrides: Partial<ProposalContext> = {}): ProposalContext {
  return {
    tasks,
    categories: [],
    coefficient: 0.5,
    referencePeriodMs: 7 * DAY,
    now: NOW,
    availableMinutes: 60,
    ...overrides,
  };
}

describe('priorityViolation', () => {
  test('priority 1 never violates', () => {
    const t = task({ id: 'a', priority: 1 });
    expect(priorityViolation(t, ctx([t]))).toBe(0);
  });

  test('not met when no completed tasks in the pair (empty denominator)', () => {
    const t = task({ id: 'b', priority: 2 });
    expect(priorityViolation(t, ctx([t], { coefficient: 0.5 }))).toBe(1);
  });

  test('not met when only lower-priority tasks were completed in the period', () => {
    const doneLow = task({ id: 'low', priority: 2, status: 'done', completedAt: NOW - HOUR });
    const candidate = task({ id: 'b', priority: 2 });
    expect(priorityViolation(candidate, ctx([doneLow, candidate]))).toBe(1);
  });

  test('met when share of higher-priority completions ≥ coefficient', () => {
    const doneHigh1 = task({ id: 'h1', priority: 1, status: 'done', completedAt: NOW - HOUR });
    const doneHigh2 = task({ id: 'h2', priority: 1, status: 'done', completedAt: NOW - 2 * HOUR });
    const doneLow = task({ id: 'l1', priority: 2, status: 'done', completedAt: NOW - HOUR });
    const candidate = task({ id: 'b', priority: 2 });
    // share = 2/3 ≥ 0.5 → met
    expect(priorityViolation(candidate, ctx([doneHigh1, doneHigh2, doneLow, candidate]))).toBe(0);
  });

  test('not met when share of higher-priority completions < coefficient', () => {
    const doneHigh = task({ id: 'h1', priority: 1, status: 'done', completedAt: NOW - HOUR });
    const doneLow1 = task({ id: 'l1', priority: 2, status: 'done', completedAt: NOW - HOUR });
    const doneLow2 = task({ id: 'l2', priority: 2, status: 'done', completedAt: NOW - HOUR });
    const candidate = task({ id: 'b', priority: 2 });
    // share = 1/3 < 0.5 → not met
    expect(priorityViolation(candidate, ctx([doneHigh, doneLow1, doneLow2, candidate]))).toBe(1);
  });

  test('completions older than the reference period are ignored', () => {
    const oldHigh = task({
      id: 'h1',
      priority: 1,
      status: 'done',
      completedAt: NOW - 8 * DAY,
    });
    const doneLow = task({ id: 'l1', priority: 2, status: 'done', completedAt: NOW - HOUR });
    const candidate = task({ id: 'b', priority: 2 });
    // only the low one counts → share 0 → not met
    expect(
      priorityViolation(candidate, ctx([oldHigh, doneLow, candidate], { referencePeriodMs: 7 * DAY })),
    ).toBe(1);
  });

  test('a task completed then reopened does not count (completedAt cleared)', () => {
    const reopened = task({ id: 'h1', priority: 1, status: 'pending', completedAt: null });
    const candidate = task({ id: 'b', priority: 2 });
    expect(priorityViolation(candidate, ctx([reopened, candidate]))).toBe(1);
  });
});

describe('granularityViolation', () => {
  test('granularity larger than the available window violates (+2)', () => {
    const t = task({ id: 'a', granularityMinutes: 90 });
    expect(granularityViolation(t, ctx([t], { availableMinutes: 60 }))).toBe(2);
  });

  test('granularity fitting the window is fine', () => {
    const t = task({ id: 'a', granularityMinutes: 60 });
    expect(granularityViolation(t, ctx([t], { availableMinutes: 60 }))).toBe(0);
  });

  test('missing granularity does not violate', () => {
    const t = task({ id: 'a', granularityMinutes: null });
    expect(granularityViolation(t, ctx([t], { availableMinutes: 5 }))).toBe(0);
  });
});

describe('violationPoints', () => {
  test('points are additive (max 3)', () => {
    const t = task({ id: 'b', priority: 2, granularityMinutes: 90 });
    expect(violationPoints(t, ctx([t], { availableMinutes: 30, coefficient: 0.5 }))).toBe(3);
  });
});

describe('proposalCandidates', () => {
  test('only leaves with pending/in-progress status', () => {
    const parent = task({ id: 'p' });
    const child = task({ id: 'c', parentId: 'p' });
    const done = task({ id: 'd', status: 'done', completedAt: NOW });
    const cancelled = task({ id: 'x', status: 'cancelled' });
    const inProgress = task({ id: 'ip', status: 'inProgress' });
    const result = proposalCandidates([parent, child, done, cancelled, inProgress]).map((t) => t.id);
    expect(result).toEqual(['c', 'ip']);
  });
});

describe('rankProposals', () => {
  test('sorts by violation points asc, then creation time asc (older first)', () => {
    const cleanNew = task({ id: 'cleanNew', createdAt: NOW - HOUR });
    const cleanOld = task({ id: 'cleanOld', createdAt: NOW - 10 * HOUR });
    const violatingOld = task({
      id: 'violatingOld',
      createdAt: NOW - 20 * HOUR,
      granularityMinutes: 120,
    });
    const ranked = rankProposals(
      ctx([cleanNew, cleanOld, violatingOld], { availableMinutes: 60 }),
    ).map((p) => p.task.id);

    expect(ranked).toEqual(['cleanOld', 'cleanNew', 'violatingOld']);
  });

  test('hasViolation is true only for positive points; points are not needed by UI', () => {
    const clean = task({ id: 'clean' });
    const bad = task({ id: 'bad', granularityMinutes: 300 });
    const ranked = rankProposals(ctx([clean, bad], { availableMinutes: 60 }));
    expect(ranked.find((p) => p.task.id === 'clean')?.hasViolation).toBe(false);
    expect(ranked.find((p) => p.task.id === 'bad')?.hasViolation).toBe(true);
  });
});
