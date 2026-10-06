import { saveTextFile } from '../save-file';

const mockExistingFile = { exists: false, delete: jest.fn() };
const mockCreatedFile = { write: jest.fn() };
const mockDirectory = { createFile: jest.fn(() => mockCreatedFile) };
const mockPickDirectory = jest.fn();

jest.mock('expo-file-system', () => ({
  Directory: { pickDirectoryAsync: () => mockPickDirectory() },
  File: class MockFile {
    get exists() {
      return mockExistingFile.exists;
    }

    delete() {
      mockExistingFile.delete();
    }
  },
}));

describe('saveTextFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExistingFile.exists = false;
    mockPickDirectory.mockResolvedValue(mockDirectory);
  });

  test('writes the content into a file in the picked folder', async () => {
    await expect(saveTextFile('{"a":1}', 'planowacz-export.json')).resolves.toBe('saved');
    expect(mockDirectory.createFile).toHaveBeenCalledWith('planowacz-export.json', 'application/json');
    expect(mockCreatedFile.write).toHaveBeenCalledWith('{"a":1}');
    expect(mockExistingFile.delete).not.toHaveBeenCalled();
  });

  test('replaces an older file carrying the same name', async () => {
    mockExistingFile.exists = true;
    await expect(saveTextFile('{}', 'planowacz-export.json')).resolves.toBe('saved');
    expect(mockExistingFile.delete).toHaveBeenCalledTimes(1);
  });

  test('stays quiet when the folder picker is dismissed', async () => {
    mockPickDirectory.mockRejectedValue(new Error('The file picker was cancelled by the user'));
    await expect(saveTextFile('{}', 'planowacz-export.json')).resolves.toBe('cancelled');
    expect(mockCreatedFile.write).not.toHaveBeenCalled();
  });

  test('reports every other failure', async () => {
    mockPickDirectory.mockRejectedValue(new Error('permission denied'));
    await expect(saveTextFile('{}', 'planowacz-export.json')).resolves.toBe('failed');
  });
});
