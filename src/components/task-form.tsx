import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from './button';
import { FormRow } from './form-row';
import { StatusControl } from './status-control';
import { TextField } from './text-field';
import { NumberStepper, TimeField } from './stepper';
import { ThemedText } from './themed-text';

import { isValidTimeStep } from '@/constants/time';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import {
  defaultGranularityForSubtask,
  defaultPlannedTimeForSubtask,
  remainingParentTime,
} from '@/logic/remaining';
import { countDescendantTasks, useStore } from '@/store/store-provider';
import type { TaskStatus } from '@/types';
import { confirmAction } from '@/utils/confirm';
import { formatDateTime, formatMinutes } from '@/utils/format';

export interface TaskFormProps {
  /** When set, the form edits this task. */
  taskId?: string;
  /** When set (create mode), the new task becomes a subtask of this parent. */
  parentId?: string;
}

interface Errors {
  name?: string;
  time?: string;
}

export function TaskForm({ taskId, parentId }: TaskFormProps) {
  const { tasks, categories, addTask, updateTask, deleteTask } = useStore();
  const { t, locale } = useI18n();
  const theme = useTheme();
  const router = useRouter();

  const existing = taskId != null ? (tasks.find((task) => task.id === taskId) ?? null) : null;
  const initialParentId = parentId ?? existing?.parentId ?? null;
  const initialParent =
    initialParentId != null ? (tasks.find((task) => task.id === initialParentId) ?? null) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [priority, setPriority] = useState(existing?.priority ?? initialParent?.priority ?? 1);
  const [categoryId, setCategoryId] = useState<string | null>(
    existing?.categoryId ?? initialParent?.categoryId ?? null,
  );
  const [granularity, setGranularity] = useState<number | null>(
    existing?.granularityMinutes ??
      (initialParent != null ? defaultGranularityForSubtask(initialParent) : null),
  );
  const [planned, setPlanned] = useState<number | null>(
    existing?.plannedTimeMinutes ??
      (initialParent != null ? defaultPlannedTimeForSubtask(initialParent, tasks) : null),
  );
  const [status, setStatus] = useState<TaskStatus>(existing?.status ?? 'pending');
  const [errors, setErrors] = useState<Errors>({});

  const missing = taskId != null && existing == null;
  useEffect(() => {
    if (missing) router.back();
  }, [missing, router]);

  if (missing) return null;

  const hasChildren = existing != null && countDescendantTasks(tasks, existing.id) > 0;
  const parentTask =
    initialParentId != null ? (tasks.find((task) => task.id === initialParentId) ?? null) : null;
  const sliderMax =
    parentTask != null ? remainingParentTime(parentTask, tasks, existing?.id) : null;

  const validate = (): boolean => {
    const next: Errors = {};
    if (name.trim().length === 0) next.name = t('task.nameRequired');
    if (!hasChildren && (planned == null || granularity == null)) {
      next.time = t('task.leafTimesRequired');
    }
    if (planned != null && !isValidTimeStep(planned)) next.time = t('task.invalidTime');
    if (granularity != null && !isValidTimeStep(granularity)) next.time = t('task.invalidTime');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const payload = {
      name: name.trim(),
      priority,
      categoryId,
      plannedTimeMinutes: planned,
      granularityMinutes: granularity,
      status,
    };
    if (existing != null) {
      updateTask(existing.id, payload);
    } else {
      addTask({ ...payload, parentId: initialParentId });
    }
    router.back();
  };

  const remove = async () => {
    if (existing == null) return;
    const childCount = countDescendantTasks(tasks, existing.id);
    const message =
      childCount > 0
        ? `${t('task.deleteChildrenMessage', { count: childCount })}\n${t('task.deleteMessage')}`
        : t('task.deleteMessage');
    const ok = await confirmAction(
      t('task.deleteTitle'),
      message,
      t('common.delete'),
      t('common.cancel'),
    );
    if (ok) {
      deleteTask(existing.id);
      router.back();
    }
  };

  const addSubtask = () => {
    if (existing == null) return;
    router.push({ pathname: '/task/new', params: { parentId: existing.id } });
  };

  const remainingHint =
    parentTask != null && sliderMax != null
      ? t('task.remainingOfParent', { time: formatMinutes(sliderMax, t) })
      : undefined;

  return (
    <View style={styles.form}>
      <TextField
        label={t('task.name')}
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (errors.name != null) setErrors((e) => ({ ...e, name: undefined }));
        }}
        placeholder={t('task.namePlaceholder')}
        error={errors.name != null}
      />
      {errors.name != null && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {errors.name}
        </ThemedText>
      )}

      <NumberStepper
        label={t('task.priority')}
        hint={t('task.priorityHint')}
        value={priority}
        onChange={setPriority}
        min={1}
      />

      <FormRow label={t('task.category')}>
        <View style={styles.chips}>
          <CategoryChip
            label={t('common.none')}
            selected={categoryId == null}
            onPress={() => setCategoryId(null)}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              color={category.color}
              selected={category.id === categoryId}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </View>
      </FormRow>

      <TimeField
        label={t('task.plannedTime')}
        value={planned}
        onChange={(value) => {
          setPlanned(value);
          if (errors.time != null) setErrors((e) => ({ ...e, time: undefined }));
        }}
        required={!hasChildren}
        error={errors.time}
        hint={hasChildren ? t('task.defaultsNote') : t('task.leafNote')}
        sliderMax={parentTask != null ? sliderMax : null}
        sliderHint={remainingHint ?? t('task.sliderHint')}
      />

      <TimeField
        label={t('task.granularity')}
        value={granularity}
        onChange={(value) => {
          setGranularity(value);
          if (errors.time != null) setErrors((e) => ({ ...e, time: undefined }));
        }}
        required={!hasChildren}
        hint={t('task.granularityHint')}
      />

      <FormRow label={t('task.status')}>
        <StatusControl value={status} onChange={setStatus} />
      </FormRow>

      {parentTask != null && (
        <FormRow label={t('task.parent')}>
          <ThemedText type="small">{t('task.subtaskOf', { name: parentTask.name })}</ThemedText>
        </FormRow>
      )}

      {existing != null && (
        <ThemedText type="small" themeColor="textTertiary">
          {t('task.created', { date: formatDateTime(existing.createdAt, locale) })}
        </ThemedText>
      )}

      <AppButton label={t('common.save')} onPress={save} />

      {existing != null && (
        <View style={styles.row}>
          <AppButton
            label={t('task.addSubtask')}
            variant="secondary"
            onPress={addSubtask}
            style={styles.flex}
          />
          <AppButton
            label={t('common.delete')}
            variant="danger"
            onPress={() => void remove()}
            style={styles.flex}
          />
        </View>
      )}
    </View>
  );
}

function CategoryChip({
  label,
  color,
  selected,
  onPress,
}: {
  label: string;
  color?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
          borderColor: selected ? theme.accent : theme.border,
          borderWidth: selected ? 2 : 1,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      {color != null && <View style={[styles.dot, { backgroundColor: color }]} />}
      <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    minHeight: 36,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
});
