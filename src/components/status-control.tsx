import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useI18n, type TranslationKey } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/store-provider';
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types';

const STATUS_LABEL: Record<TaskStatus, TranslationKey> = {
  pending: 'status.pending',
  inProgress: 'status.inProgress',
  done: 'status.done',
  cancelled: 'status.cancelled',
};

const STATUS_COLOR_KEY = {
  pending: 'pending',
  inProgress: 'inProgress',
  done: 'done',
  cancelled: 'cancelled',
} as const;

export function statusLabelKey(status: TaskStatus): TranslationKey {
  return STATUS_LABEL[status];
}

export function statusColorKey(status: TaskStatus): (typeof STATUS_COLOR_KEY)[TaskStatus] {
  return STATUS_COLOR_KEY[status];
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  pending: 'inProgress',
  inProgress: 'done',
  done: 'cancelled',
  cancelled: 'pending',
};

/** Compact status chip for task cards — tap to cycle through the statuses. */
export function StatusChip({ task }: { task: Task }) {
  const theme = useTheme();
  const { t } = useI18n();
  const { setTaskStatus } = useStore();
  const color = theme[statusColorKey(task.status)];
  const label = t(STATUS_LABEL[task.status]);

  return (
    <Pressable
      onPress={() => setTaskStatus(task.id, NEXT_STATUS[task.status])}
      accessibilityRole="button"
      accessibilityLabel={t('status.cycle', { status: label })}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: color, backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}>
      <ThemedText type="small" style={{ color, fontWeight: '600' }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/** Full status selector used in the task form. */
export function StatusControl({
  value,
  onChange,
}: {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}) {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <View style={styles.row}>
      {TASK_STATUSES.map((status) => {
        const selected = status === value;
        const color = theme[statusColorKey(status)];
        return (
          <Pressable
            key={status}
            onPress={() => onChange(status)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.chip,
              {
                borderColor: selected ? color : theme.border,
                backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText type="small" style={{ color: selected ? color : theme.textSecondary, fontWeight: '600' }}>
              {t(STATUS_LABEL[status])}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    minHeight: 32,
    justifyContent: 'center',
  },
});
