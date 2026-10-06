import { Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { NoteForm } from '@/components/note-form';
import { useI18n } from '@/i18n';

export default function EditNoteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const noteId = typeof id === 'string' ? id : undefined;

  return (
    <>
      <Stack.Screen options={{ title: t('notes.edit') }} />
      <Screen underHeader>
        {noteId != null && <NoteForm noteId={noteId} />}
      </Screen>
    </>
  );
}
