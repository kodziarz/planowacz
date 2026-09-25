import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';

import { StoreProvider, useStore, type StoreValue } from '../store-provider';

let store: StoreValue;

function Capture() {
  const value = useStore();
  useEffect(() => {
    store = value;
  }, [value]);
  return null;
}

async function renderStore() {
  render(
    <StoreProvider>
      <Capture />
    </StoreProvider>,
  );
  await waitFor(() => expect(store.loaded).toBe(true));
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('StoreProvider', () => {
  test('loads empty defaults and persists added tasks', async () => {
    await renderStore();
    expect(store.tasks).toEqual([]);
    expect(store.categories).toEqual([]);
    expect(store.settings.language).toBe('system');

    act(() => {
      store.addTask({
        name: 'Write report',
        priority: 1,
        categoryId: null,
        plannedTimeMinutes: 30,
        granularityMinutes: 15,
        parentId: null,
        status: 'pending',
      });
    });

    expect(store.tasks).toHaveLength(1);
    expect(store.tasks[0].completedAt).toBeNull();
    await waitFor(() =>
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@planowacz/tasks',
        expect.any(String),
      ),
    );
  });

  test('setTaskStatus sets and clears completedAt around done', async () => {
    await renderStore();
    let id = '';
    act(() => {
      id = store.addTask({
        name: 'Task',
        priority: 1,
        categoryId: null,
        plannedTimeMinutes: 15,
        granularityMinutes: 5,
        parentId: null,
        status: 'pending',
      }).id;
    });

    act(() => store.setTaskStatus(id, 'done'));
    expect(store.tasks[0].status).toBe('done');
    expect(store.tasks[0].completedAt).toEqual(expect.any(Number));

    act(() => store.setTaskStatus(id, 'pending'));
    expect(store.tasks[0].completedAt).toBeNull();
  });

  test('deleteTask cascades to descendants', async () => {
    await renderStore();
    let parentId = '';
    let childId = '';
    act(() => {
      parentId = store.addTask({
        name: 'Parent',
        priority: 1,
        categoryId: null,
        plannedTimeMinutes: 60,
        granularityMinutes: 15,
        parentId: null,
        status: 'pending',
      }).id;
      childId = store.addTask({
        name: 'Child',
        priority: 1,
        categoryId: null,
        plannedTimeMinutes: 30,
        granularityMinutes: 15,
        parentId,
        status: 'pending',
      }).id;
      store.addTask({
        name: 'Unrelated',
        priority: 2,
        categoryId: null,
        plannedTimeMinutes: 5,
        granularityMinutes: 5,
        parentId: null,
        status: 'pending',
      });
    });
    expect(store.tasks).toHaveLength(3);

    act(() => store.deleteTask(parentId));

    expect(store.tasks.map((t) => t.id)).not.toContain(parentId);
    expect(store.tasks.map((t) => t.id)).not.toContain(childId);
    expect(store.tasks).toHaveLength(1);
  });

  test('deleteCategory detaches it from tasks', async () => {
    await renderStore();
    let categoryId = '';
    act(() => {
      categoryId = store.addCategory({ name: 'Work', color: '#0072B2' }).id;
      store.addTask({
        name: 'Task',
        priority: 1,
        categoryId,
        plannedTimeMinutes: 15,
        granularityMinutes: 5,
        parentId: null,
        status: 'pending',
      });
    });

    act(() => store.deleteCategory(categoryId));

    expect(store.categories).toHaveLength(0);
    expect(store.tasks[0].categoryId).toBeNull();
  });

  test('updateSettings merges the patch', async () => {
    await renderStore();
    act(() => store.updateSettings({ priorityCoefficient: 0.75, language: 'pl' }));
    expect(store.settings.priorityCoefficient).toBe(0.75);
    expect(store.settings.language).toBe('pl');
    expect(store.settings.priorityReferencePeriodDays).toBe(7);
  });
});
