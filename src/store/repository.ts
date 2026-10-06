import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeList, normalizeCategory, normalizeNote, normalizeSituation, normalizeTask } from '@/logic/normalize';
import {
  DEFAULT_SETTINGS,
  type AppData,
  type Category,
  type Note,
  type Settings,
  type Situation,
  type Task,
} from '@/types';

const KEYS = {
  tasks: '@planowacz/tasks',
  categories: '@planowacz/categories',
  situations: '@planowacz/situations',
  notes: '@planowacz/notes',
  settings: '@planowacz/settings',
} as const;

async function readJson(key: string, fallback: unknown): Promise<unknown> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Best-effort persistence; the in-memory state remains the source of truth.
  }
}

export async function loadAppData(): Promise<AppData> {
  const [tasksRaw, categoriesRaw, situationsRaw, notesRaw, settingsRaw] = await Promise.all([
    readJson(KEYS.tasks, []),
    readJson(KEYS.categories, []),
    readJson(KEYS.situations, []),
    readJson(KEYS.notes, []),
    readJson(KEYS.settings, {}),
  ]);
  return {
    tasks: normalizeList(tasksRaw, normalizeTask),
    categories: normalizeList(categoriesRaw, normalizeCategory),
    situations: normalizeList(situationsRaw, normalizeSituation),
    notes: normalizeList(notesRaw, normalizeNote),
    settings: { ...DEFAULT_SETTINGS, ...(typeof settingsRaw === 'object' && settingsRaw != null ? settingsRaw : {}) },
  };
}

export function saveTasks(tasks: Task[]): Promise<void> {
  return writeJson(KEYS.tasks, tasks);
}

export function saveCategories(categories: Category[]): Promise<void> {
  return writeJson(KEYS.categories, categories);
}

export function saveSituations(situations: Situation[]): Promise<void> {
  return writeJson(KEYS.situations, situations);
}

export function saveNotes(notes: Note[]): Promise<void> {
  return writeJson(KEYS.notes, notes);
}

export function saveSettings(settings: Settings): Promise<void> {
  return writeJson(KEYS.settings, settings);
}
