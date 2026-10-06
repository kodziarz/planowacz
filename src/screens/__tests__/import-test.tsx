import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';

import ImportScreen from '@/app/import';

import { I18nProvider } from '@/i18n';
import { buildExportPayload } from '@/logic/data-transfer';
import { StoreProvider, useStore, type StoreValue } from '@/store/store-provider';
import { DEFAULT_SETTINGS, type Task } from '@/types';

jest.mock('expo-router', () => {
  const back = jest.fn();
  return {
    useRouter: () => ({ back, canGoBack: () => true, push: jest.fn() }),
    __back: back,
  };
});

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  File: class {
    uri: string;
    constructor(uri: string) {
      this.uri = uri;
    }
  },
  Paths: { cache: '/cache' },
}));

const getDocumentAsync = DocumentPicker.getDocumentAsync as unknown as jest.Mock;
const routerMock = jest.requireMock('expo-router') as { __back: jest.Mock };

const importedTask: Task = {
  id: 'task-imported',
  name: 'Imported task',
  priority: 1,
  categoryId: null,
  plannedTimeMinutes: 30,
  granularityMinutes: 5,
  parentId: null,
  status: 'pending',
  description: null,
  timeEntries: [],
  createdAt: 1000,
  completedAt: null,
};

function makeJson(overrides: Partial<Parameters<typeof buildExportPayload>[0]> = {}): string {
  return JSON.stringify(
    buildExportPayload({
      tasks: [importedTask],
      categories: [],
      situations: [],
      notes: [],
      settings: DEFAULT_SETTINGS,
      ...overrides,
    }),
  );
}

function respondWithJson(json: string) {
  getDocumentAsync.mockResolvedValue({
    canceled: false,
    assets: [
      {
        uri: 'file:///tmp/export.json',
        name: 'export.json',
        lastModified: 0,
        file: { text: async () => json },
      },
    ],
  });
}

let store: StoreValue;

function Capture() {
  const value = useStore();
  useEffect(() => {
    store = value;
  }, [value]);
  return null;
}

async function renderImport() {
  const utils = render(
    <StoreProvider>
      <Capture />
      <I18nProvider language="en">
        <ImportScreen />
      </I18nProvider>
    </StoreProvider>,
  );
  await waitFor(() => expect(store.loaded).toBe(true));
  return utils;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('ImportScreen', () => {
  test('adds imported tasks by default and navigates back', async () => {
    respondWithJson(makeJson());
    const { getByTestId } = await renderImport();

    fireEvent.press(getByTestId('import-choose'));
    await waitFor(() => expect(getByTestId('import-apply')).toBeTruthy());

    fireEvent.press(getByTestId('import-apply'));
    await waitFor(() => expect(store.tasks).toHaveLength(1));
    expect(store.tasks[0].name).toBe('Imported task');
    expect(routerMock.__back).toHaveBeenCalled();
  });

  test('remove plus add replaces existing tasks', async () => {
    const { getByTestId } = await renderImport();
    let existingId = '';
    act(() => {
      existingId = store.addTask({
        name: 'Existing',
        priority: 1,
        categoryId: null,
        plannedTimeMinutes: 15,
        granularityMinutes: 5,
        parentId: null,
        status: 'pending',
      }).id;
    });

    respondWithJson(makeJson());
    fireEvent.press(getByTestId('import-choose'));
    await waitFor(() => expect(getByTestId('import-apply')).toBeTruthy());

    fireEvent.press(getByTestId('import-remove-tasks'));
    fireEvent.press(getByTestId('import-apply'));
    await waitFor(() => expect(store.tasks).toHaveLength(1));
    expect(store.tasks[0].id).not.toBe(existingId);
    expect(store.tasks[0].name).toBe('Imported task');
  });

  test('apply stays disabled until something is selected', async () => {
    respondWithJson(makeJson());
    const { getByTestId, getByText } = await renderImport();

    fireEvent.press(getByTestId('import-choose'));
    await waitFor(() => expect(getByTestId('import-apply')).toBeTruthy());

    for (const type of ['tasks', 'categories', 'situations', 'notes']) {
      fireEvent.press(getByTestId(`import-add-${type}`));
    }
    expect(getByTestId('import-apply').props.accessibilityState.disabled).toBe(true);
    expect(getByText('Select what to import first.')).toBeTruthy();

    fireEvent.press(getByTestId('import-add-tasks'));
    expect(getByTestId('import-apply').props.accessibilityState.disabled).toBeFalsy();
  });

  test('shows a parse error for invalid files', async () => {
    respondWithJson('not json');
    const { getByTestId, findByTestId, queryByTestId } = await renderImport();

    fireEvent.press(getByTestId('import-choose'));
    const error = await findByTestId('import-error');
    expect(error.props.children).toBe('The selected file is not valid JSON.');
    expect(queryByTestId('import-apply')).toBeNull();
  });

  test('cancelling the picker keeps the empty state', async () => {
    getDocumentAsync.mockResolvedValue({ canceled: true, assets: null });
    const { getByTestId, queryByTestId } = await renderImport();

    fireEvent.press(getByTestId('import-choose'));
    await waitFor(() => expect(getDocumentAsync).toHaveBeenCalled());
    expect(queryByTestId('import-apply')).toBeNull();
    expect(queryByTestId('import-error')).toBeNull();
  });
});
