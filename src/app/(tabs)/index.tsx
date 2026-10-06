import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/button';
import { Screen } from '@/components/screen';
import { TaskCard } from '@/components/task-card';
import { ThemedText } from '@/components/themed-text';
import { TimeAmountInput } from '@/components/time-amount-input';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { rankProposals } from '@/logic/proposal';
import { useStore } from '@/store/store-provider';

const DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_VISIBLE = 3;
const MORE_COUNT = 5;
const NOW_REFRESH_MS = 30_000;
const DEFAULT_AMOUNT = 30;
const AMOUNT_MIN = 15;
const AMOUNT_MAX = 8 * 60;
const AMOUNT_STEP = 15;

export default function AvailabilityScreen() {
  const { tasks, categories, settings } = useStore();
  const { t } = useI18n();
  const router = useRouter();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [limit, setLimit] = useState(INITIAL_VISIBLE);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), NOW_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const ranked = useMemo(
    () =>
      rankProposals({
        tasks,
        categories,
        coefficient: settings.priorityCoefficient,
        referencePeriodMs: settings.priorityReferencePeriodDays * DAY_MS,
        now,
        availableMinutes: amount,
      }),
    [
      tasks,
      categories,
      settings.priorityCoefficient,
      settings.priorityReferencePeriodDays,
      now,
      amount,
    ],
  );

  const visible = ranked.slice(0, limit);
  const hasMore = ranked.length > limit;

  return (
    <Screen title={t('tab.availability')}>
      <TimeAmountInput
        label={t('availability.availableTime')}
        hint={t('availability.availableTimeHint')}
        value={amount}
        onChange={(value) => {
          setNow(Date.now());
          setAmount(value ?? DEFAULT_AMOUNT);
        }}
        required
        min={AMOUNT_MIN}
        max={AMOUNT_MAX}
        step={AMOUNT_STEP}
        testID="availability-amount"
      />

      <View style={styles.section}>
        <ThemedText type="smallBold">{t('availability.proposals')}</ThemedText>

        {visible.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('availability.empty')}
          </ThemedText>
        ) : (
          visible.map(({ task, hasViolation }) => (
            <TaskCard
              key={task.id}
              task={task}
              parent={task.parentId != null ? (taskById.get(task.parentId) ?? null) : null}
              category={task.categoryId != null ? (categoryById.get(task.categoryId) ?? null) : null}
              marked={hasViolation}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
            />
          ))
        )}

        {hasMore && (
          <AppButton label={t('availability.displayMore')} variant="secondary" onPress={() => setLimit((l) => l + MORE_COUNT)} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
});
