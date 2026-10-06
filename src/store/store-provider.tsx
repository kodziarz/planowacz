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

import { loadAppData, saveCategories, saveNotes, saveSettings, saveSituations, saveTasks } from './repository';

import type { ImportResult } from '@/logic/data-transfer';
import { newId } from '@/utils/id';
import {
  DEFAULT_SETTINGS,
  type Category,
  type Note,
  type Settings,
  type Situation,
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
  description?: string | null;
}

export interface CategoryInput {
  name: string;
  color: string;
}

export interface SituationInput {
  name: string;
  description: string | null;
  localization: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface NoteInput {
  situationId: string;
  name: string;
  description: string | null;
}

export interface StoreValue {
  loaded: boolean;
  tasks: Task[];
  categories: Category[];
  situations: Situation[];
  notes: Note[];
  settings: Settings;
  addTask: (input: TaskInput) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  /** Appends a time-log entry; a pending task automatically becomes in progress. */
  addTimeEntry: (taskId: string, minutes: number, at?: number) => void;
  deleteTask: (id: string) => void;
  addCategory: (input: CategoryInput) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSituation: (input: SituationInput) => Situation;
  updateSituation: (id: string, patch: Partial<Situation>) => void;
  /** Removes the situation together with its notes. */
  deleteSituation: (id: string) => void;
  addNote: (input: NoteInput) => Note;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  /** Atomically applies a computed import plan (null parts are left untouched). */
  applyImport: (result: ImportResult) => void;
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
  const [situations, setSituations] = useState<Situation[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadAppData().then((data) => {
      if (cancelled) return;
      setTasks(data.tasks);
      setCategories(data.categories);
      setSituations(data.situations);
      setNotes(data.notes);
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
    if (hydrated.current) void saveSituations(situations);
  }, [situations]);

  useEffect(() => {
    if (hydrated.current) void saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (hydrated.current) void saveSettings(settings);
  }, [settings]);

  const addTask = useCallback((input: TaskInput): Task => {
    const now = Date.now();
    const task: Task = withStatusEffects(
      { id: newId(), createdAt: now, completedAt: null, timeEntries: [], description: null, ...input },
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

  const addTimeEntry = useCallback((taskId: string, minutes: number, at?: number) => {
    if (minutes <= 0) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const entry = { id: newId(), minutes, at: at ?? Date.now() };
        // Entries stay sorted oldest first, so the newest one is always last.
        const withEntry = {
          ...task,
          timeEntries: [...task.timeEntries, entry].sort((a, b) => a.at - b.at),
        };
        return withEntry.status === 'pending'
          ? withStatusEffects({ ...withEntry, status: 'inProgress' }, entry.at)
          : withEntry;
      }),
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

  const addSituation = useCallback((input: SituationInput): Situation => {
    const situation: Situation = { id: newId(), createdAt: Date.now(), ...input };
    setSituations((prev) => [...prev, situation]);
    return situation;
  }, []);

  const updateSituation = useCallback((id: string, patch: Partial<Situation>) => {
    setSituations((prev) =>
      prev.map((situation) =>
        situation.id === id ? { ...situation, ...patch, id: situation.id } : situation,
      ),
    );
  }, []);

  const deleteSituation = useCallback((id: string) => {
    setSituations((prev) => prev.filter((situation) => situation.id !== id));
    setNotes((prev) => prev.filter((note) => note.situationId !== id));
  }, []);

  const addNote = useCallback((input: NoteInput): Note => {
    const note: Note = { id: newId(), createdAt: Date.now(), ...input };
    setNotes((prev) => [...prev, note]);
    return note;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...patch, id: note.id } : note)),
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyImport = useCallback((result: ImportResult) => {
    if (result.tasks != null) setTasks(result.tasks);
    if (result.categories != null) setCategories(result.categories);
    if (result.situations != null) setSituations(result.situations);
    if (result.notes != null) setNotes(result.notes);
    if (result.settings != null) setSettings(result.settings);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      loaded,
      tasks,
      categories,
      situations,
      notes,
      settings,
      addTask,
      updateTask,
      setTaskStatus,
      addTimeEntry,
      deleteTask,
      addCategory,
      updateCategory,
      deleteCategory,
      addSituation,
      updateSituation,
      deleteSituation,
      addNote,
      updateNote,
      deleteNote,
      updateSettings,
      applyImport,
    }),
    [
      loaded,
      tasks,
      categories,
      situations,
      notes,
      settings,
      addTask,
      updateTask,
      setTaskStatus,
      addTimeEntry,
      deleteTask,
      addCategory,
      updateCategory,
      deleteCategory,
      addSituation,
      updateSituation,
      deleteSituation,
      addNote,
      updateNote,
      deleteNote,
      updateSettings,
      applyImport,
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
