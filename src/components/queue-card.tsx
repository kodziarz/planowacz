import { ScrollView, StyleSheet, View } from 'react-native';

import { TaskCard } from './task-card';
import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import type { PriorityQueue } from '@/logic/queues';
import type { Category, Task } from '@/types';
import { formatMinutes } from '@/utils/format';

const CARD_WIDTH = 260;
const CARD_GAP = Spacing.two;

export interface QueueCardProps {
  queue: PriorityQueue;
  taskById: Map<string, Task>;
  categoryById: Map<string, Category>;
  onTaskPress: (task: Task) => void;
}

export function QueueCard({ queue, taskById, categoryById, onTaskPress }: QueueCardProps) {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.priority}>
          {t('queues.priority', { count: queue.priority })}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {`${t('queues.waiting')}: ${t('queues.waitingValue', {
            count: queue.count,
            inProgress: queue.inProgressCount,
          })}`}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {`${t('queues.plannedTotal')}: ${formatMinutes(queue.totalPlannedMinutes, t)}`}
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.track}>
        {queue.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            parent={task.parentId != null ? (taskById.get(task.parentId) ?? null) : null}
            category={task.categoryId != null ? (categoryById.get(task.categoryId) ?? null) : null}
            onPress={() => onTaskPress(task)}
            style={{ width: CARD_WIDTH }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    gap: 2,
  },
  priority: {
    fontSize: 16,
  },
  track: {
    gap: CARD_GAP,
    paddingRight: Spacing.three,
  },
});
