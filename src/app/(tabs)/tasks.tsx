import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/button';
import { Screen } from '@/components/screen';
import { TaskCard } from '@/components/task-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { childTasks } from '@/logic/remaining';
import { useStore } from '@/store/store-provider';
import type { Category, Task } from '@/types';

function TaskTree({
  task,
  depth,
  tasks,
  taskById,
  categoryById,
  onOpen,
}: {
  task: Task;
  depth: number;
  tasks: Task[];
  taskById: Map<string, Task>;
  categoryById: Map<string, Category>;
  onOpen: (task: Task) => void;
}) {
  const children = childTasks(tasks, task.id);
  return (
    <View>
      <View style={depth > 0 ? { marginLeft: Spacing.three * depth } : undefined}>
        <TaskCard
          task={task}
          parent={task.parentId != null ? (taskById.get(task.parentId) ?? null) : null}
          category={task.categoryId != null ? (categoryById.get(task.categoryId) ?? null) : null}
          onPress={() => onOpen(task)}
          style={styles.card}
        />
      </View>
      {children.map((child) => (
        <TaskTree
          key={child.id}
          task={child}
          depth={depth + 1}
          tasks={tasks}
          taskById={taskById}
          categoryById={categoryById}
          onOpen={onOpen}
        />
      ))}
    </View>
  );
}

export default function TasksScreen() {
  const { tasks, categories } = useStore();
  const { t } = useI18n();
  const router = useRouter();

  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const roots = useMemo(
    () => tasks.filter((task) => task.parentId == null).sort((a, b) => a.createdAt - b.createdAt),
    [tasks],
  );

  const openTask = (task: Task) =>
    router.push({ pathname: '/task/[id]', params: { id: task.id } });

  return (
    <Screen title={t('tab.tasks')}>
      <AppButton label={t('tasks.new')} onPress={() => router.push('/task/new')} />

      {roots.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('tasks.empty')}
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {roots.map((task) => (
            <TaskTree
              key={task.id}
              task={task}
              depth={0}
              tasks={tasks}
              taskById={taskById}
              categoryById={categoryById}
              onOpen={openTask}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  card: {
    marginBottom: Spacing.two,
  },
});
