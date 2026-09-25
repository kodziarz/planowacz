import { isLeafTask } from './remaining';

import type { Category, Task } from '@/types';

export interface ProposalContext {
  tasks: Task[];
  categories: Category[];
  /** Priority coefficient in (0, 1]. */
  coefficient: number;
  /** Length of the priority reference period in milliseconds. */
  referencePeriodMs: number;
  now: number;
  /** Currently available amount of time, in minutes (one window starting now). */
  availableMinutes: number;
}

export interface Proposal {
  task: Task;
  /** 0 = obeys all rules; +1 priority coefficient; +2 granularity. Never shown to the user. */
  violationPoints: number;
  hasViolation: boolean;
}

/** Active statuses that can still be performed. */
export function isActiveStatus(status: Task['status']): boolean {
  return status === 'pending' || status === 'inProgress';
}

/**
 * Candidates for the availability view: leaf tasks (no subtasks) that are
 * pending or in progress.
 */
export function proposalCandidates(tasks: Task[]): Task[] {
  return tasks.filter((task) => isActiveStatus(task.status) && isLeafTask(tasks, task.id));
}

/**
 * Priority coefficient check (one-sided): look back over the reference period
 * at tasks completed with priority p-1 or p (p = candidate priority, 1 = highest).
 * Condition is met iff share completed at p-1 ≥ coefficient (denominator 0 → not met).
 * Not met → the candidate (priority p) violates (+1). p = 1 → never violates.
 */
export function priorityViolation(task: Task, ctx: ProposalContext): 0 | 1 {
  if (task.priority <= 1) return 0;
  const since = ctx.now - ctx.referencePeriodMs;
  const inPair = ctx.tasks.filter(
    (other) =>
      (other.priority === task.priority - 1 || other.priority === task.priority) &&
      other.completedAt != null &&
      other.completedAt >= since &&
      other.completedAt <= ctx.now,
  );
  const higherDone = inPair.filter((other) => other.priority === task.priority - 1).length;
  const share = inPair.length > 0 ? higherDone / inPair.length : 0;
  return share >= ctx.coefficient ? 0 : 1;
}

/**
 * Granularity condition: the declared availability is a single window starting
 * now; the task's granularity must fit into it.
 */
export function granularityViolation(task: Task, ctx: ProposalContext): 0 | 2 {
  if (task.granularityMinutes != null && task.granularityMinutes > ctx.availableMinutes) {
    return 2;
  }
  return 0;
}

export function violationPoints(task: Task, ctx: ProposalContext): number {
  return priorityViolation(task, ctx) + granularityViolation(task, ctx);
}

/**
 * Ranked proposals: violation points ascending, ties broken by creation time
 * (older first). Points are kept internally only — UI checks `hasViolation`.
 */
export function rankProposals(ctx: ProposalContext): Proposal[] {
  return proposalCandidates(ctx.tasks)
    .map((task) => {
      const points = violationPoints(task, ctx);
      return { task, violationPoints: points, hasViolation: points > 0 };
    })
    .sort((a, b) => {
      if (a.violationPoints !== b.violationPoints) {
        return a.violationPoints - b.violationPoints;
      }
      return a.task.createdAt - b.task.createdAt;
    });
}
