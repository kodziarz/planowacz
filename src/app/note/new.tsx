import { Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { NoteForm } from '@/components/note-form';
import { useI18n } from '@/i18n';

export default function NewNoteRoute() {
  const { situationId } = useLocalSearchParams<{ situationId?: string }>();
  const { t } = useI18n();
  const parent = typeof situationId === 'string' ? situationId : undefined;

  return (
    <>
      <Stack.Screen options={{ title: t('notes.new') }} />
      <Screen underHeader>
        <NoteForm situationId={parent} />
      </Screen>
    </>
  );
}
