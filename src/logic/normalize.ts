import type { Category, Note, Situation, Task, TaskStatus, TimeEntry } from '@/types';
import { TASK_STATUSES } from '@/types';

type Raw = Record<string, unknown>;

function isRaw(value: unknown): value is Raw {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function nullableStr(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function nullableNum(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function status(value: unknown): TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus) ? (value as TaskStatus) : 'pending';
}

function timeEntries(value: unknown): TimeEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRaw).flatMap((raw) => {
    const id = raw.id;
    const minutes = raw.minutes;
    const at = raw.at;
    if (typeof id !== 'string' || typeof minutes !== 'number' || typeof at !== 'number') return [];
    if (minutes <= 0 || !Number.isFinite(minutes)) return [];
    return [{ id, minutes, at }];
  });
}

/** Coerces loosely-typed stored data into a valid Task, or null when unusable. */
export function normalizeTask(value: unknown): Task | null {
  if (!isRaw(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  return {
    id: value.id,
    name: value.name,
    priority: Math.max(1, Math.trunc(num(value.priority, 1))),
    categoryId: nullableStr(value.categoryId),
    plannedTimeMinutes: nullableNum(value.plannedTimeMinutes),
    granularityMinutes: nullableNum(value.granularityMinutes),
    parentId: nullableStr(value.parentId),
    status: status(value.status),
    description: nullableStr(value.description),
    timeEntries: timeEntries(value.timeEntries),
    createdAt: num(value.createdAt, 0),
    completedAt: nullableNum(value.completedAt),
  };
}

export function normalizeCategory(value: unknown): Category | null {
  if (!isRaw(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  return {
    id: value.id,
    name: value.name,
    color: str(value.color, '#808080'),
    createdAt: num(value.createdAt, 0),
  };
}

export function normalizeSituation(value: unknown): Situation | null {
  if (!isRaw(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  return {
    id: value.id,
    name: value.name,
    description: nullableStr(value.description),
    localization: nullableStr(value.localization),
    latitude: nullableNum(value.latitude),
    longitude: nullableNum(value.longitude),
    createdAt: num(value.createdAt, 0),
  };
}

export function normalizeNote(value: unknown): Note | null {
  if (!isRaw(value) || typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  if (typeof value.situationId !== 'string') return null;
  return {
    id: value.id,
    situationId: value.situationId,
    name: value.name,
    description: nullableStr(value.description),
    createdAt: num(value.createdAt, 0),
  };
}

export function normalizeList<T>(value: unknown, normalize: (raw: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalize).filter((item): item is T => item != null);
}
