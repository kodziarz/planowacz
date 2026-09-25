import { Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { TaskForm } from '@/components/task-form';
import { useI18n } from '@/i18n';

export default function NewTaskRoute() {
  const { parentId } = useLocalSearchParams<{ parentId?: string }>();
  const { t } = useI18n();
  const parent = typeof parentId === 'string' ? parentId : undefined;

  return (
    <>
      <Stack.Screen options={{ title: parent != null ? t('task.newSubtask') : t('task.new') }} />
      <Screen underHeader>
        <TaskForm parentId={parent} />
      </Screen>
    </>
  );
}
