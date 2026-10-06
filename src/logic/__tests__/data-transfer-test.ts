import {
  DEFAULT_IMPORT_FLAGS,
  EXPORT_APP,
  EXPORT_SCHEMA_VERSION,
  ExportParseError,
  buildExportPayload,
  computeImport,
  normalizeSettings,
  parseExportPayload,
  type ImportFlags,
} from '../data-transfer';

import { DEFAULT_SETTINGS, type AppData, type Task } from '@/types';

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
    description: null,
    timeEntries: [],
    createdAt: NOW,
    completedAt: null,
    ...overrides,
  };
}

function emptyData(): AppData {
  return { tasks: [], categories: [], situations: [], notes: [], settings: { ...DEFAULT_SETTINGS } };
}

function flags(overrides: Partial<ImportFlags> = {}): ImportFlags {
  return {
    tasks: overrides.tasks ?? { ...DEFAULT_IMPORT_FLAGS.tasks },
    categories: overrides.categories ?? { ...DEFAULT_IMPORT_FLAGS.categories },
    situations: overrides.situations ?? { ...DEFAULT_IMPORT_FLAGS.situations },
    notes: overrides.notes ?? { ...DEFAULT_IMPORT_FLAGS.notes },
    settings: overrides.settings ?? DEFAULT_IMPORT_FLAGS.settings,
  };
}

describe('parseExportPayload', () => {
  test('round-trips a payload built by buildExportPayload', () => {
    const data = emptyData();
    data.tasks = [task({ id: 't1', description: 'desc', timeEntries: [{ id: 'e', minutes: 15, at: NOW }] })];
    const parsed = parseExportPayload(JSON.stringify(buildExportPayload(data)));
    expect(parsed.app).toBe(EXPORT_APP);
    expect(parsed.schemaVersion).toBe(EXPORT_SCHEMA_VERSION);
    expect(parsed.data.tasks).toEqual(data.tasks);
    expect(parsed.data.settings).toEqual(data.settings);
  });

  test('rejects non-JSON, foreign apps and newer schemas', () => {
    expect(() => parseExportPayload('nope')).toThrow(ExportParseError);
    expect(() => parseExportPayload(JSON.stringify({ app: 'other', data: {} }))).toThrow(ExportParseError);
    expect(() =>
      parseExportPayload(JSON.stringify({ app: EXPORT_APP, schemaVersion: 99, data: {} })),
    ).toThrow(ExportParseError);
    expect(() => parseExportPayload(JSON.stringify({ app: EXPORT_APP }))).toThrow(ExportParseError);
  });

  test('tolerates garbage entries inside arrays', () => {
    const parsed = parseExportPayload(
      JSON.stringify({ app: EXPORT_APP, schemaVersion: 1, data: { tasks: [{ bogus: 1 }, { id: 'ok', name: 'x' }] } }),
    );
    expect(parsed.data.tasks).toHaveLength(1);
    expect(parsed.data.tasks[0].id).toBe('ok');
  });
});

describe('normalizeSettings', () => {
  test('keeps valid values and falls back on garbage', () => {
    expect(normalizeSettings({ priorityCoefficient: 0.75, priorityReferencePeriodDays: 30, language: 'pl' })).toEqual({
      priorityCoefficient: 0.75,
      priorityReferencePeriodDays: 30,
      language: 'pl',
    });
    expect(normalizeSettings({ priorityCoefficient: 5, priorityReferencePeriodDays: 0, language: 'xx' })).toEqual(
      DEFAULT_SETTINGS,
    );
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });
});

describe('computeImport', () => {
  const payload = buildExportPayload({
    tasks: [task({ id: 't1', categoryId: 'c1' }), task({ id: 't2', parentId: 't1', categoryId: 'c1' })],
    categories: [{ id: 'c1', name: 'Work', color: '#000', createdAt: NOW }],
    situations: [{ id: 's1', name: 'Trip', description: null, localization: null, latitude: null, longitude: null, createdAt: NOW }],
    notes: [
      { id: 'n1', situationId: 's1', name: 'Pack', description: null, createdAt: NOW },
      { id: 'n2', situationId: 'gone', name: 'Orphan', description: null, createdAt: NOW },
    ],
    settings: { priorityCoefficient: 0.8, priorityReferencePeriodDays: 14, language: 'pl' },
  });

  test('defaults append everything with fresh ids and repaired references', () => {
    const current = emptyData();
    const result = computeImport(current, payload, flags());

    expect(result.tasks).toHaveLength(2);
    expect(result.tasks!.map((t) => t.id)).not.toContain('t1');
    const [first, second] = result.tasks!;
    expect(second.parentId).toBe(first.id);
    expect(first.categoryId).toBe(result.categories![0].id);
    expect(result.categories).toHaveLength(1);
    expect(result.situations).toHaveLength(1);
    // Orphan note (situation never exists) is dropped.
    expect(result.notes!.map((n) => n.name)).toEqual(['Pack']);
    expect(result.notes![0].situationId).toBe(result.situations![0].id);
    expect(result.settings).toBeNull();
  });

  test('remove + add replaces the collections', () => {
    const current = emptyData();
    current.tasks = [task({ id: 'old' })];
    current.categories = [{ id: 'oldC', name: 'Old', color: '#111', createdAt: NOW }];
    const result = computeImport(current, payload, flags({
      tasks: { remove: true, add: true },
      categories: { remove: true, add: true },
    }));
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks!.some((t) => t.id === 'old')).toBe(false);
    expect(result.categories!.map((c) => c.name)).toEqual(['Work']);
  });

  test('remove-only wipes a type, add-only keeps the rest', () => {
    const current = emptyData();
    current.situations = [{ id: 's0', name: 'Existing', description: null, localization: null, latitude: null, longitude: null, createdAt: NOW }];
    current.notes = [{ id: 'n0', situationId: 's0', name: 'Keep?', description: null, createdAt: NOW }];
    const result = computeImport(current, payload, flags({
      situations: { remove: true, add: false },
      notes: { remove: false, add: false },
      tasks: { remove: false, add: false },
      categories: { remove: false, add: false },
    }));
    expect(result.situations).toEqual([]);
    expect(result.tasks).toBeNull();
    expect(result.categories).toBeNull();
    // Notes cannot outlive their situations: both disappear.
    expect(result.notes).toEqual([]);
  });

  test('all-off flags change nothing (null everywhere)', () => {
    const current = emptyData();
    const result = computeImport(current, payload, flags({
      tasks: { remove: false, add: false },
      categories: { remove: false, add: false },
      situations: { remove: false, add: false },
      notes: { remove: false, add: false },
    }));
    expect(result.tasks).toBeNull();
    expect(result.categories).toBeNull();
    expect(result.situations).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.settings).toBeNull();
  });

  test('importing twice does not collide ids', () => {
    const current = emptyData();
    const first = computeImport(current, payload, flags());
    const merged: AppData = {
      tasks: first.tasks!,
      categories: first.categories!,
      situations: first.situations!,
      notes: first.notes!,
      settings: { ...DEFAULT_SETTINGS },
    };
    const second = computeImport(merged, payload, flags());
    const ids = second.tasks!.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(second.tasks).toHaveLength(4);
  });

  test('settings replace only when requested', () => {
    const current = emptyData();
    expect(computeImport(current, payload, flags({ settings: true })).settings).toEqual({
      priorityCoefficient: 0.8,
      priorityReferencePeriodDays: 14,
      language: 'pl',
    });
    expect(computeImport(current, payload, flags({ settings: false })).settings).toBeNull();
  });

  test('tasks referencing a removed category get null', () => {
    const current = emptyData();
    current.tasks = [task({ id: 'old', categoryId: 'goneC' })];
    const result = computeImport(current, payload, flags({
      categories: { remove: true, add: false },
      tasks: { remove: false, add: false },
    }));
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks![0].categoryId).toBeNull();
  });
});
