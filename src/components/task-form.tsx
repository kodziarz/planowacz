import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from './button';
import { DateTimeField } from './date-time-field';
import { FormRow } from './form-row';
import { StatusControl } from './status-control';
import { TextField } from './text-field';
import { NumberStepper } from './stepper';
import { TimeAmountInput } from './time-amount-input';
import { ThemedText } from './themed-text';

import {
  isValidTimeStep,
  MIN_TIME_MINUTES,
  PLANNED_MAX_MINUTES,
  SPENT_MAX_MINUTES,
  SPENT_MIN_MINUTES,
  SPENT_STEP_MINUTES,
  TIME_STEP_MINUTES,
} from '@/constants/time';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { previousTaskPrompts } from '@/logic/prompts';
import {
  defaultGranularityForSubtask,
  defaultPlannedTimeForSubtask,
  remainingParentTime,
} from '@/logic/remaining';
import { countDescendantTasks, useStore } from '@/store/store-provider';
import type { Task, TaskStatus } from '@/types';
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
  const { tasks, categories, addTask, updateTask, deleteTask, addTimeEntry } = useStore();
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
  const [description, setDescription] = useState(existing?.description ?? '');
  const [spend, setSpend] = useState<number | null>(null);
  const [spendAt, setSpendAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Errors>({});

  const missing = taskId != null && existing == null;
  const prompts = useMemo(
    () => previousTaskPrompts(tasks, name, 3).filter((prompt) => prompt.id !== taskId),
    [tasks, name, taskId],
  );
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
    const trimmedDescription = description.trim();
    const payload = {
      name: name.trim(),
      priority,
      categoryId,
      plannedTimeMinutes: planned,
      granularityMinutes: granularity,
      status,
      description: trimmedDescription.length > 0 ? trimmedDescription : null,
    };
    if (existing != null) {
      updateTask(existing.id, payload);
    } else {
      addTask({ ...payload, parentId: initialParentId });
    }
    router.back();
  };

  const applyPrompt = (prompt: Task) => {
    setPriority(prompt.priority);
    setCategoryId(prompt.categoryId);
    setPlanned(prompt.plannedTimeMinutes);
    setGranularity(prompt.granularityMinutes);
    setDescription(prompt.description ?? '');
    setErrors({});
  };

  const recordTime = () => {
    if (existing == null || spend == null || spend <= 0) return;
    addTimeEntry(existing.id, spend, spendAt);
    setSpend(null);
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

      {prompts.length > 0 && (
        <FormRow label={t('task.prompts')}>
          <View style={styles.chips}>
            {prompts.map((prompt) => (
              <CategoryChip
                key={prompt.id}
                label={prompt.name}
                selected={false}
                onPress={() => applyPrompt(prompt)}
              />
            ))}
          </View>
        </FormRow>
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

      <TimeAmountInput
        label={t('task.plannedTime')}
        value={planned}
        onChange={(value) => {
          setPlanned(value);
          if (errors.time != null) setErrors((e) => ({ ...e, time: undefined }));
        }}
        required={!hasChildren}
        error={errors.time}
        hint={hasChildren ? t('task.defaultsNote') : t('task.leafNote')}
        min={MIN_TIME_MINUTES}
        max={sliderMax != null ? Math.min(sliderMax, PLANNED_MAX_MINUTES) : PLANNED_MAX_MINUTES}
        step={TIME_STEP_MINUTES}
        sliderHint={remainingHint ?? t('task.sliderHint')}
      />

      <TimeAmountInput
        label={t('task.granularity')}
        value={granularity}
        onChange={(value) => {
          setGranularity(value);
          if (errors.time != null) setErrors((e) => ({ ...e, time: undefined }));
        }}
        required={!hasChildren}
        hint={t('task.granularityHint')}
        min={MIN_TIME_MINUTES}
        max={Math.max(MIN_TIME_MINUTES, planned ?? PLANNED_MAX_MINUTES)}
        step={TIME_STEP_MINUTES}
      />

      <TextField
        label={t('task.description')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('task.descriptionPlaceholder')}
        multiline
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

      {existing != null && (
        <View style={styles.timeSpent}>
          <ThemedText type="smallBold">{t('task.timeSpent')}</ThemedText>
          {existing.timeEntries.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('task.timeSpentEmpty')}
            </ThemedText>
          ) : (
            existing.timeEntries.map((entry) => (
              <ThemedText key={entry.id} type="small" themeColor="textSecondary">
                {`${formatMinutes(entry.minutes, t)} · ${formatDateTime(entry.at, locale)}`}
              </ThemedText>
            ))
          )}
          <TimeAmountInput
            label={t('task.addTime')}
            value={spend}
            onChange={setSpend}
            min={SPENT_MIN_MINUTES}
            max={SPENT_MAX_MINUTES}
            step={SPENT_STEP_MINUTES}
            sliderHint={t('task.addTimeHint')}
          />
          <DateTimeField label={t('task.entryTime')} value={spendAt} onChange={setSpendAt} />
          <AppButton
            label={t('task.addTime')}
            variant="secondary"
            onPress={recordTime}
            disabled={spend == null}
          />
        </View>
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
  timeSpent: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
});
