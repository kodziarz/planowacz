import { Platform } from 'react-native';
import { Directory, File } from 'expo-file-system';

export type SaveOutcome = 'saved' | 'cancelled' | 'failed';

/** Both platforms report a dismissed picker as an error whose message says so. */
function isPickerCancelled(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes('cancel');
}

function overwriteExisting(directory: Directory, fileName: string): void {
  try {
    const existing = new File(directory, fileName);
    if (existing.exists) existing.delete();
  } catch {
    // Best effort — destinations that refuse to delete keep numbered copies instead.
  }
}

async function saveToPickedFolder(content: string, fileName: string): Promise<SaveOutcome> {
  try {
    const directory = await Directory.pickDirectoryAsync();
    overwriteExisting(directory, fileName);
    const file = directory.createFile(fileName, 'application/json');
    file.write(content);
    return 'saved';
  } catch (error) {
    return isPickerCancelled(error) ? 'cancelled' : 'failed';
  }
}

function download(content: string, fileName: string): SaveOutcome {
  try {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return 'saved';
  } catch {
    return 'failed';
  }
}

/**
 * Writes text into a file the user can reach outside the app: a folder they
 * pick on Android and iOS, a download in the browser.
 */
export async function saveTextFile(content: string, fileName: string): Promise<SaveOutcome> {
  if (Platform.OS === 'web') return download(content, fileName);
  return saveToPickedFolder(content, fileName);
}
