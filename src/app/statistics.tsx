import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PieChart, PieLegend } from '@/components/pie-chart';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { spentMinutesByCategory } from '@/logic/stats';
import { useStore } from '@/store/store-provider';
import { formatMinutes, formatPercent } from '@/utils/format';

const DAY_MS = 24 * 60 * 60 * 1000;
const NO_CATEGORY_COLOR = '#bdbdbd';

type Period = 7 | 30 | 0;

export default function StatisticsScreen() {
  const { tasks, categories } = useStore();
  const { t, locale } = useI18n();
  const theme = useTheme();
  const [period, setPeriod] = useState<Period>(7);
  const [now] = useState(() => Date.now());

  const start = period === 0 ? 0 : now - period * DAY_MS;
  const rows = useMemo(() => spentMinutesByCategory(tasks, start, now), [tasks, start, now]);
  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const total = rows.reduce((sum, row) => sum + row.minutes, 0);
  const colorOf = (categoryId: string | null): string =>
    categoryId != null ? (categoryById.get(categoryId)?.color ?? NO_CATEGORY_COLOR) : NO_CATEGORY_COLOR;
  const labelOf = (categoryId: string | null): string =>
    categoryId != null ? (categoryById.get(categoryId)?.name ?? t('common.none')) : t('common.none');

  const slices = rows.map((row) => ({ value: row.minutes, color: colorOf(row.categoryId) }));
  const legendEntries = rows.map((row) => ({
    label: labelOf(row.categoryId),
    value: row.minutes,
    color: colorOf(row.categoryId),
    time: formatMinutes(row.minutes, t),
    percent: total > 0 ? formatPercent(row.minutes / total, locale) : formatPercent(0, locale),
  }));

  return (
    <Screen title={t('tab.statistics')} back>
      <View style={styles.periods}>
        {(
          [
            { value: 7, labelKey: 'statistics.period7' },
            { value: 30, labelKey: 'statistics.period30' },
            { value: 0, labelKey: 'statistics.periodAll' },
          ] as const
        ).map(({ value, labelKey }) => {
          const selected = period === value;
          return (
            <Pressable
              key={value}
              onPress={() => setPeriod(value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.chip,
                {
                  borderColor: selected ? theme.accent : theme.border,
                  backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                {t(labelKey)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {total <= 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('statistics.empty')}
        </ThemedText>
      ) : (
        <View style={styles.body}>
          <View style={styles.pieWrap}>
            <PieChart data={slices} centerLabel={formatMinutes(total, t)} />
          </View>
          <ThemedText type="small" themeColor="textSecondary" style={styles.total}>
            {`${t('statistics.total')}: ${formatMinutes(total, t)}`}
          </ThemedText>
          <PieLegend entries={legendEntries} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  periods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    minHeight: 36,
    justifyContent: 'center',
  },
  body: {
    gap: Spacing.three,
    alignItems: 'center',
  },
  pieWrap: {
    alignItems: 'center',
  },
  total: {
    alignSelf: 'flex-start',
  },
});
