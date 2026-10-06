import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TaskCard } from '../task-card';

import { I18nProvider } from '@/i18n';
import { StoreProvider, useStore, type StoreValue } from '@/store/store-provider';
import type { Task, TaskStatus } from '@/types';

const NOW = 1_700_000_000_000;

beforeEach(async () => {
  await AsyncStorage.clear();
});

function task(overrides: Partial<Task> & Pick<Task, 'id'>): Task {
  return {
    name: 'Task',
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

let store: StoreValue;

function Capture() {
  const value = useStore();
  useEffect(() => {
    store = value;
  }, [value]);
  return null;
}

function CardFromStore({
  parent,
  marked,
}: {
  parent?: Task | null;
  marked?: boolean;
}) {
  const { tasks } = useStore();
  const current = tasks[0];
  if (!current) return null;
  return <TaskCard task={current} parent={parent} marked={marked} />;
}

async function renderCards(
  elements: React.ReactNode,
  seed?: { tasks?: Task[] },
) {
  const utils = render(
    <StoreProvider>
      <Capture />
      <I18nProvider language="en">{elements}</I18nProvider>
    </StoreProvider>,
  );
  await waitFor(() => expect(store.loaded).toBe(true));
  if (seed?.tasks != null) {
    for (const seedTask of seed.tasks) {
      act(() => {
        store.addTask({
          name: seedTask.name,
          priority: seedTask.priority,
          categoryId: seedTask.categoryId,
          plannedTimeMinutes: seedTask.plannedTimeMinutes,
          granularityMinutes: seedTask.granularityMinutes,
          parentId: seedTask.parentId,
          status: seedTask.status as TaskStatus,
        });
      });
    }
  }
  return utils;
}

describe('TaskCard', () => {
  test('renders name, priority and meta chips', async () => {
    const { getByText } = await renderCards(
      <TaskCard task={task({ id: 'a', name: 'Write report', priority: 3 })} />,
    );
    expect(getByText('Write report')).toBeTruthy();
    expect(getByText('P3')).toBeTruthy();
    expect(getByText('plan 30 min')).toBeTruthy();
    expect(getByText('gran 15 min')).toBeTruthy();
  });

  test('shows the direct parent breadcrumb for subtasks', async () => {
    const { getByText } = await renderCards(
      <TaskCard
        task={task({ id: 'c', name: 'Child part', parentId: 'p' })}
        parent={task({ id: 'p', name: 'Big project' })}
      />,
    );
    expect(getByText('Big project / Child part')).toBeTruthy();
  });

  test('marks violations with the reservations badge (never the number)', async () => {
    const { getByLabelText, queryByText } = await renderCards(
      <TaskCard task={task({ id: 'a' })} marked />,
    );
    expect(getByLabelText('Suggestion with reservations')).toBeTruthy();
    expect(queryByText('1')).toBeNull();
    expect(queryByText('2')).toBeNull();
    expect(queryByText('3')).toBeNull();
  });

  test('tapping the status chip cycles pending → in progress', async () => {
    const seeded = task({ id: 'seed', name: 'Cycle me', status: 'pending' });
    const { getByLabelText } = await renderCards(<CardFromStore />, {
      tasks: [seeded],
    });

    const pendingChip = getByLabelText('Status: Pending. Tap to change.');
    act(() => {
      fireEvent.press(pendingChip);
    });

    expect(getByLabelText('Status: In progress. Tap to change.')).toBeTruthy();
    expect(store.tasks[0]?.status).toBe('inProgress');
  });

  test('quick add logs time from the modal and starts a pending task', async () => {
    const seeded = task({ id: 'seed', name: 'Log me', status: 'pending' });
    const { getByLabelText, getByText } = await renderCards(<CardFromStore />, {
      tasks: [seeded],
    });

    act(() => {
      fireEvent.press(getByLabelText('Add time spent to Log me'));
    });

    act(() => {
      fireEvent.changeText(getByLabelText('Add time h'), '1');
    });
    act(() => {
      fireEvent.press(getByText('Confirm'));
    });

    expect(store.tasks[0]?.status).toBe('inProgress');
    expect(store.tasks[0]?.timeEntries).toHaveLength(1);
    expect(store.tasks[0]?.timeEntries[0]?.minutes).toBe(60);
  });

  test('shows the spent chip once time entries exist', async () => {
    const { getByText } = await renderCards(
      <TaskCard
        task={task({
          id: 'a',
          timeEntries: [{ id: 'e', minutes: 45, at: NOW }],
        })}
      />,
    );
    expect(getByText('spent 45 min')).toBeTruthy();
  });
});
