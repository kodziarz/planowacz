import { normalizeCategory, normalizeNote, normalizeSituation, normalizeTask } from './normalize';

import { newId } from '@/utils/id';
import {
  DEFAULT_SETTINGS,
  type AppData,
  type Category,
  type LanguageSetting,
  type Note,
  type Settings,
  type Situation,
  type Task,
} from '@/types';

export const EXPORT_APP = 'planowacz';
export const EXPORT_SCHEMA_VERSION = 1;

export interface ExportPayload {
  app: typeof EXPORT_APP;
  schemaVersion: number;
  exportedAt: number;
  data: {
    tasks: Task[];
    categories: Category[];
    situations: Situation[];
    notes: Note[];
    settings: Settings;
  };
}

export interface TypeFlags {
  /** Remove all currently stored objects of this type. */
  remove: boolean;
  /** Append the imported objects of this type. */
  add: boolean;
}

export interface ImportFlags {
  tasks: TypeFlags;
  categories: TypeFlags;
  situations: TypeFlags;
  notes: TypeFlags;
  /** Replace the current settings with the imported ones. */
  settings: boolean;
}

export const DEFAULT_IMPORT_FLAGS: ImportFlags = {
  tasks: { remove: false, add: true },
  categories: { remove: false, add: true },
  situations: { remove: false, add: true },
  notes: { remove: false, add: true },
  settings: false,
};

/** null = leave that part of the store untouched. */
export interface ImportResult {
  tasks: Task[] | null;
  categories: Category[] | null;
  situations: Situation[] | null;
  notes: Note[] | null;
  settings: Settings | null;
}

export class ExportParseError extends Error {}

type Raw = Record<string, unknown>;

function isRaw(value: unknown): value is Raw {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

const LANGUAGES: LanguageSetting[] = ['system', 'en', 'pl'];

export function normalizeSettings(raw: unknown): Settings {
  if (!isRaw(raw)) return { ...DEFAULT_SETTINGS };
  const coefficient = raw.priorityCoefficient;
  const period = raw.priorityReferencePeriodDays;
  const language = raw.language;
  return {
    priorityCoefficient:
      typeof coefficient === 'number' && coefficient > 0 && coefficient <= 1
        ? coefficient
        : DEFAULT_SETTINGS.priorityCoefficient,
    priorityReferencePeriodDays:
      typeof period === 'number' && Number.isInteger(period) && period >= 1 && period <= 365
        ? period
        : DEFAULT_SETTINGS.priorityReferencePeriodDays,
    language: LANGUAGES.includes(language as LanguageSetting)
      ? (language as LanguageSetting)
      : DEFAULT_SETTINGS.language,
  };
}

export function buildExportPayload(data: AppData): ExportPayload {
  return {
    app: EXPORT_APP,
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: Date.now(),
    data: {
      tasks: data.tasks,
      categories: data.categories,
      situations: data.situations,
      notes: data.notes,
      settings: data.settings,
    },
  };
}

export function parseExportPayload(text: string): ExportPayload {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ExportParseError('not json');
  }
  if (!isRaw(raw)) throw new ExportParseError('not an object');
  if (raw.app != null && raw.app !== EXPORT_APP) throw new ExportParseError('foreign app');
  if (typeof raw.schemaVersion === 'number' && raw.schemaVersion > EXPORT_SCHEMA_VERSION) {
    throw new ExportParseError('newer schema');
  }
  const data = raw.data;
  if (!isRaw(data)) throw new ExportParseError('missing data');
  return {
    app: EXPORT_APP,
    schemaVersion:
      typeof raw.schemaVersion === 'number' ? raw.schemaVersion : EXPORT_SCHEMA_VERSION,
    exportedAt: typeof raw.exportedAt === 'number' ? raw.exportedAt : 0,
    data: {
      tasks: list(data.tasks, normalizeTask),
      categories: list(data.categories, normalizeCategory),
      situations: list(data.situations, normalizeSituation),
      notes: list(data.notes, normalizeNote),
      settings: normalizeSettings(data.settings),
    },
  };
}

function list<T>(raw: unknown, normalize: (value: unknown) => T | null): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalize).filter((item): item is T => item != null);
}

interface CurrentData {
  tasks: Task[];
  categories: Category[];
  situations: Situation[];
  notes: Note[];
  settings: Settings;
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Applies the per-type flags to the imported payload.
 * Imported objects always get fresh ids; references (parentId, categoryId,
 * situationId) are repaired against the final collections, or nulled when the
 * target no longer exists. Orphaned notes are dropped.
 */
export function computeImport(
  current: CurrentData,
  payload: ExportPayload,
  flags: ImportFlags,
): ImportResult {
  // Categories first — tasks reference them.
  const keptCategories = flags.categories.remove ? [] : current.categories;
  const categoryIdMap = new Map<string, string>();
  const importedCategories = flags.categories.add
    ? payload.data.categories.map((category) => {
        const id = newId();
        categoryIdMap.set(category.id, id);
        return { ...category, id };
      })
    : [];
  const categories = [...keptCategories, ...importedCategories];
  const categoryIds = new Set(categories.map((category) => category.id));
  const resolveCategoryId = (categoryId: string | null): string | null => {
    if (categoryId == null) return null;
    const mapped = categoryIdMap.get(categoryId);
    if (mapped != null) return mapped;
    return categoryIds.has(categoryId) ? categoryId : null;
  };

  // Situations — notes reference them.
  const keptSituations = flags.situations.remove ? [] : current.situations;
  const situationIdMap = new Map<string, string>();
  const importedSituations = flags.situations.add
    ? payload.data.situations.map((situation) => {
        const id = newId();
        situationIdMap.set(situation.id, id);
        return { ...situation, id };
      })
    : [];
  const situations = [...keptSituations, ...importedSituations];
  const situationIds = new Set(situations.map((situation) => situation.id));

  // Tasks.
  const keptTasks = flags.tasks.remove ? [] : current.tasks;
  const taskIdMap = new Map<string, string>();
  const importedTasks = flags.tasks.add
    ? payload.data.tasks.map((task) => {
        const id = newId();
        taskIdMap.set(task.id, id);
        return { ...task, id };
      })
    : [];
  const resolveParentId = (parentId: string | null): string | null => {
    if (parentId == null) return null;
    const mapped = taskIdMap.get(parentId);
    if (mapped != null) return mapped;
    return keptTasks.some((task) => task.id === parentId) ? parentId : null;
  };
  const tasks = [...keptTasks, ...importedTasks].map((task) => ({
    ...task,
    parentId: resolveParentId(task.parentId),
    categoryId: resolveCategoryId(task.categoryId),
  }));

  // Notes — remapped to the new situation ids, then sanitized against the final situations.
  const keptNotes = flags.notes.remove ? [] : current.notes;
  const importedNotes = flags.notes.add
    ? payload.data.notes.map((note) => ({ ...note, id: newId() }))
    : [];
  const resolveSituationId = (situationId: string): string | null => {
    const mapped = situationIdMap.get(situationId);
    if (mapped != null) return mapped;
    return situationIds.has(situationId) ? situationId : null;
  };
  const notes = [...keptNotes, ...importedNotes].flatMap((note) => {
    const situationId = resolveSituationId(note.situationId);
    return situationId != null ? [{ ...note, situationId }] : [];
  });

  const settings = flags.settings ? payload.data.settings : null;

  return {
    tasks: same(tasks, current.tasks) ? null : tasks,
    categories: same(categories, current.categories) ? null : categories,
    situations: same(situations, current.situations) ? null : situations,
    notes: same(notes, current.notes) ? null : notes,
    settings: settings != null && !same(settings, current.settings) ? settings : null,
  };
}
