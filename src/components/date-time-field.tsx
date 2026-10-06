import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from './button';
import { FormRow } from './form-row';
import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { formatDateTime } from '@/utils/format';

export interface DateTimeFieldProps {
  label: string;
  /** Selected moment (ms since epoch). */
  value: number;
  onChange: (value: number) => void;
  testID?: string;
}

/** Android opens the system dialogs one after another, iOS gets an in-app sheet. */
type Stage = 'date' | 'time' | 'sheet';

export function DateTimeField({ label, value, onChange, testID }: DateTimeFieldProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const { t, locale } = useI18n();
  const [draft, setDraft] = useState(() => new Date(value));
  const [stage, setStage] = useState<Stage | null>(null);

  const close = () => setStage(null);

  const open = () => {
    setDraft(new Date(value));
    setStage(Platform.OS === 'ios' ? 'sheet' : 'date');
  };

  const onSystemChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      close();
      return;
    }
    const next = selected ?? draft;
    setDraft(next);
    if (stage === 'date') {
      setStage('time');
      return;
    }
    onChange(next.getTime());
    close();
  };

  return (
    <FormRow label={label}>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatDateTime(value, locale)}`}
        testID={testID}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <ThemedText type="small">{formatDateTime(value, locale)}</ThemedText>
        <ThemedText type="small" themeColor="textTertiary">
          ▾
        </ThemedText>
      </Pressable>

      {stage === 'date' && (
        <DateTimePicker value={draft} mode="date" display="default" onChange={onSystemChange} />
      )}
      {stage === 'time' && (
        <DateTimePicker value={draft} mode="time" display="default" onChange={onSystemChange} />
      )}

      {stage === 'sheet' && (
        <Modal visible transparent animationType="fade" onRequestClose={close}>
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
              <ThemedText type="smallBold">{label}</ThemedText>
              <DateTimePicker
                value={draft}
                mode="datetime"
                display="spinner"
                themeVariant={scheme === 'dark' ? 'dark' : 'light'}
                onChange={(_, selected) => {
                  if (selected != null) setDraft(selected);
                }}
              />
              <View style={styles.actions}>
                <AppButton
                  label={t('common.cancel')}
                  variant="secondary"
                  onPress={close}
                  style={styles.flex}
                />
                <AppButton
                  label={t('common.confirm')}
                  onPress={() => {
                    onChange(draft.getTime());
                    close();
                  }}
                  style={styles.flex}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </FormRow>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
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
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
});
