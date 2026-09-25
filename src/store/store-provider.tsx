import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { loadAppData, saveCategories, saveSettings, saveTasks } from './repository';

import { newId } from '@/utils/id';
import {
  DEFAULT_SETTINGS,
  type Category,
  type Settings,
  type Task,
  type TaskStatus,
} from '@/types';

export interface TaskInput {
  name: string;
  priority: number;
  categoryId: string | null;
  plannedTimeMinutes: number | null;
  granularityMinutes: number | null;
  parentId: string | null;
  status: TaskStatus;
}

export interface CategoryInput {
  name: string;
  color: string;
}

export interface StoreValue {
  loaded: boolean;
  tasks: Task[];
  categories: Category[];
  settings: Settings;
  addTask: (input: TaskInput) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  addCategory: (input: CategoryInput) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function withStatusEffects(task: Task, now: number): Task {
  if (task.status === 'done') {
    return task.completedAt == null ? { ...task, completedAt: now } : task;
  }
  return task.completedAt == null ? task : { ...task, completedAt: null };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadAppData().then((data) => {
      if (cancelled) return;
      setTasks(data.tasks);
      setCategories(data.categories);
      setSettings(data.settings);
      hydrated.current = true;
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated.current) void saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (hydrated.current) void saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (hydrated.current) void saveSettings(settings);
  }, [settings]);

  const addTask = useCallback((input: TaskInput): Task => {
    const now = Date.now();
    const task: Task = withStatusEffects(
      { id: newId(), createdAt: now, completedAt: null, ...input },
      now,
    );
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        return withStatusEffects({ ...task, ...patch, id: task.id }, Date.now());
      }),
    );
  }, []);

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? withStatusEffects({ ...task, status }, Date.now()) : task)),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const toDelete = new Set<string>([id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const task of prev) {
          if (task.parentId != null && toDelete.has(task.parentId) && !toDelete.has(task.id)) {
            toDelete.add(task.id);
            grew = true;
          }
        }
      }
      return prev.filter((task) => !toDelete.has(task.id));
    });
  }, []);

  const addCategory = useCallback((input: CategoryInput): Category => {
    const category: Category = { id: newId(), createdAt: Date.now(), ...input };
    setCategories((prev) => [...prev, category]);
    return category;
  }, []);

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((category) => (category.id === id ? { ...category, ...patch, id: category.id } : category)),
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== id));
    setTasks((prev) =>
      prev.map((task) => (task.categoryId === id ? { ...task, categoryId: null } : task)),
    );
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      loaded,
      tasks,
      categories,
      settings,
      addTask,
      updateTask,
      setTaskStatus,
      deleteTask,
      addCategory,
      updateCategory,
      deleteCategory,
      updateSettings,
    }),
    [
      loaded,
      tasks,
      categories,
      settings,
      addTask,
      updateTask,
      setTaskStatus,
      deleteTask,
      addCategory,
      updateCategory,
      deleteCategory,
      updateSettings,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return ctx;
}

/** Counts descendants of a task (subtasks at any depth). Exposed for the form screens. */
export function countDescendantTasks(tasks: Task[], id: string): number {
  let count = 0;
  let frontier = [id];
  const seen = new Set<string>([id]);
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const task of tasks) {
      if (task.parentId != null && frontier.includes(task.parentId) && !seen.has(task.id)) {
        seen.add(task.id);
        count += 1;
        next.push(task.id);
      }
    }
    frontier = next;
  }
  return count;
}
