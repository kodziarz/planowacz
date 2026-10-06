import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { QuickAddTimeButton } from './quick-add-time';
import { StatusChip } from './status-control';
import { ThemedText } from './themed-text';
import { ViolationMarker } from './violation-marker';

import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import type { Category, Task } from '@/types';
import { formatMinutes } from '@/utils/format';

export interface TaskCardProps {
  task: Task;
  parent?: Task | null;
  category?: Category | null;
  /** True when violation points > 0 — marked colorblind-friendly (badge + border). Never show the number. */
  marked?: boolean;
  /** Hides the quick time logging button. */
  quickAdd?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function TaskCard({
  task,
  parent,
  category,
  marked = false,
  quickAdd = true,
  onPress,
  style,
}: TaskCardProps) {
  const theme = useTheme();
  const { t } = useI18n();

  const borderColor = marked ? theme.warningBorder : theme.border;
  const backgroundColor = marked ? theme.warningBg : theme.backgroundElement;
  const spentMinutes = task.timeEntries.reduce((total, entry) => total + entry.minutes, 0);
  const canLogTime =
    quickAdd && (task.status === 'pending' || task.status === 'inProgress');

  return (
    <Pressable
      onPress={onPress}
      disabled={onPress == null}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.card,
        { borderColor, backgroundColor, opacity: onPress ? (pressed ? 0.8 : 1) : 1 },
        style,
      ]}>
      <View style={styles.header}>
        {marked && <ViolationMarker />}
        <ThemedText type="smallBold" numberOfLines={2} style={styles.title}>
          {parent != null ? (
            <>
              <ThemedText type="small" themeColor="textSecondary">
                {`${parent.name} / `}
              </ThemedText>
              {task.name}
            </>
          ) : (
            task.name
          )}
        </ThemedText>
        <View style={styles.statusWrap}>
          <StatusChip task={task} />
        </View>
      </View>

      <View style={styles.meta}>
        <View style={[styles.metaChip, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('meta.priority', { count: task.priority })}
          </ThemedText>
        </View>

        {category != null && (
          <View style={styles.metaChip}>
            <View style={[styles.dot, { backgroundColor: category.color, borderColor: theme.border }]} />
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {category.name}
            </ThemedText>
          </View>
        )}

        {task.plannedTimeMinutes != null && (
          <View style={[styles.metaChip, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('meta.planned', { time: formatMinutes(task.plannedTimeMinutes, t) })}
            </ThemedText>
          </View>
        )}

        {task.granularityMinutes != null && (
          <View style={[styles.metaChip, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('meta.granularity', { time: formatMinutes(task.granularityMinutes, t) })}
            </ThemedText>
          </View>
        )}

        {spentMinutes > 0 && (
          <View style={[styles.metaChip, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('meta.spent', { time: formatMinutes(spentMinutes, t) })}
            </ThemedText>
          </View>
        )}

        {canLogTime && (
          <View style={styles.quickAdd}>
            <QuickAddTimeButton task={task} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  statusWrap: {
    flexShrink: 0,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    backgroundColor: 'transparent',
    maxWidth: 180,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 0.5,
  },
  quickAdd: {
    marginLeft: 'auto',
  },
});
