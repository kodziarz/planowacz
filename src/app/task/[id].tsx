import { Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { TaskForm } from '@/components/task-form';
import { useI18n } from '@/i18n';

export default function EditTaskRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const taskId = typeof id === 'string' ? id : undefined;

  return (
    <>
      <Stack.Screen options={{ title: t('task.edit') }} />
      <Screen underHeader>
        {taskId != null && <TaskForm taskId={taskId} />}
      </Screen>
    </>
  );
}
