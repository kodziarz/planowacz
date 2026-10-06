import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { QueueCard } from '@/components/queue-card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { buildQueues } from '@/logic/queues';
import { useStore } from '@/store/store-provider';
import type { Task } from '@/types';

export default function QueuesScreen() {
  const { tasks, categories } = useStore();
  const { t } = useI18n();
  const router = useRouter();

  const queues = useMemo(() => buildQueues(tasks), [tasks]);
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const openTask = (task: Task) =>
    router.push({ pathname: '/task/[id]', params: { id: task.id } });

  return (
    <Screen title={t('tab.queues')} back>
      {queues.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('queues.empty')}
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {queues.map((queue) => (
            <QueueCard
              key={queue.priority}
              queue={queue}
              taskById={taskById}
              categoryById={categoryById}
              onTaskPress={openTask}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
});
