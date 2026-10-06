import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from './button';
import { DateTimeField } from './date-time-field';
import { ThemedText } from './themed-text';
import { TimeAmountInput } from './time-amount-input';

import { Spacing } from '@/constants/theme';
import { SPENT_MAX_MINUTES, SPENT_MIN_MINUTES, SPENT_STEP_MINUTES } from '@/constants/time';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/store-provider';
import type { Task } from '@/types';

/** Round “+” button on a task card that logs time spent via a small modal. */
export function QuickAddTimeButton({ task }: { task: Task }) {
  const { addTimeEntry } = useStore();
  const { t } = useI18n();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [at, setAt] = useState(() => Date.now());

  const close = () => {
    setVisible(false);
    setMinutes(null);
    setAt(Date.now());
  };

  const confirm = () => {
    if (minutes != null && minutes > 0) addTimeEntry(task.id, minutes, at);
    close();
  };

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('task.quickAdd', { name: task.name })}
        hitSlop={8}
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: theme.backgroundSelected,
            borderColor: theme.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <ThemedText type="smallBold" style={styles.plus}>
          +
        </ThemedText>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          />
          <View
            style={[
              styles.dialog,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <ThemedText type="smallBold">{t('task.quickAddTitle', { name: task.name })}</ThemedText>
            <TimeAmountInput
              label={t('task.addTime')}
              value={minutes}
              onChange={setMinutes}
              required
              min={SPENT_MIN_MINUTES}
              max={SPENT_MAX_MINUTES}
              step={SPENT_STEP_MINUTES}
              sliderHint={t('task.addTimeHint')}
            />
            <DateTimeField label={t('task.entryTime')} value={at} onChange={setAt} />
            <View style={styles.actions}>
              <AppButton label={t('common.cancel')} variant="secondary" onPress={close} style={styles.flex} />
              <AppButton label={t('common.confirm')} onPress={confirm} disabled={minutes == null} style={styles.flex} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 18,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: Spacing.three,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
});
