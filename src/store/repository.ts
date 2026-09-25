import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, type AppData, type Category, type Settings, type Task } from '@/types';

const KEYS = {
  tasks: '@planowacz/tasks',
  categories: '@planowacz/categories',
  settings: '@planowacz/settings',
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
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
  const [tasks, categories, settings] = await Promise.all([
    readJson<Task[]>(KEYS.tasks, []),
    readJson<Category[]>(KEYS.categories, []),
    readJson<Partial<Settings>>(KEYS.settings, {}),
  ]);
  return {
    tasks,
    categories,
    settings: { ...DEFAULT_SETTINGS, ...settings },
  };
}

export function saveTasks(tasks: Task[]): Promise<void> {
  return writeJson(KEYS.tasks, tasks);
}

export function saveCategories(categories: Category[]): Promise<void> {
  return writeJson(KEYS.categories, categories);
}

export function saveSettings(settings: Settings): Promise<void> {
  return writeJson(KEYS.settings, settings);
}
