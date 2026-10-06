import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { FormRow } from './form-row';
import { ThemedText } from './themed-text';
import { UiSlider } from './ui-slider';

import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { formatMinutes } from '@/utils/format';

export interface TimeAmountInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  hint?: string;
  error?: string;
  /** Hides the clear button (required fields cannot be emptied). */
  required?: boolean;
  /** Slider range — typed values outside it simply disable the slider. */
  min: number;
  max: number;
  step: number;
  /** Set to false to render the typed h/m inputs only (quick-add modal). */
  slider?: boolean;
  sliderHint?: string;
  testID?: string;
}

function digits(text: string): string {
  return text.replace(/[^0-9]/g, '');
}

function parseField(text: string): number | null {
  const clean = digits(text);
  return clean === '' ? null : parseInt(clean, 10);
}

/**
 * Time amount with two numeric inputs (hours + minutes) and a stepped slider.
 * When the typed value leaves the slider range, the slider disables itself.
 */
export function TimeAmountInput({
  label,
  value,
  onChange,
  hint,
  error,
  required = false,
  min,
  max,
  step,
  slider = true,
  sliderHint,
  testID,
}: TimeAmountInputProps) {
  const theme = useTheme();
  const { t } = useI18n();

  const hoursText = value != null ? String(Math.floor(value / 60)) : '';
  const minutesText = value != null ? String(value % 60) : '';

  const commit = (hoursInput: number | null, minutesInput: number | null) => {
    if (hoursInput === null && minutesInput === null) {
      onChange(null);
      return;
    }
    const total = (hoursInput ?? 0) * 60 + (minutesInput ?? 0);
    // Clearing one side of an all-zero value empties the whole field.
    onChange(total === 0 && (hoursInput === null || minutesInput === null) ? null : total);
  };

  const outOfRange = value != null && (value < min || value > max);
  const sliderValue = value != null ? Math.min(Math.max(value, min), max) : min;

  return (
    <FormRow label={label} hint={hint} error={error}>
      <View style={styles.row}>
        <TextInput
          value={hoursText}
          onChangeText={(text) => commit(parseField(text), minutesText === '' ? null : parseField(minutesText))}
          placeholder="0"
          placeholderTextColor={theme.textTertiary}
          keyboardType="number-pad"
          accessibilityLabel={`${label} ${t('timeUnit.hours')}`}
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {t('timeUnit.hours')}
        </ThemedText>
        <TextInput
          value={minutesText}
          onChangeText={(text) => commit(hoursText === '' ? null : parseField(hoursText), parseField(text))}
          placeholder="0"
          placeholderTextColor={theme.textTertiary}
          keyboardType="number-pad"
          accessibilityLabel={`${label} ${t('timeUnit.minutes')}`}
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {t('timeUnit.minutes')}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.value}>
          {value != null ? formatMinutes(value, t) : t('common.notSet')}
        </ThemedText>
        {!required && (
          <Pressable
            onPress={() => onChange(null)}
            disabled={value == null}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.clear')}
            style={({ pressed }) => [
              styles.clear,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                opacity: value == null ? 0.4 : pressed ? 0.7 : 1,
              },
            ]}>
            <ThemedText type="smallBold" style={{ fontSize: 16 }}>
              ×
            </ThemedText>
          </Pressable>
        )}
      </View>

      {slider && (
        <View style={styles.sliderBlock}>
          <UiSlider
            value={sliderValue}
            onValueChange={(v) => onChange(Math.round(v / step) * step)}
            min={min}
            max={max}
            step={step}
            disabled={outOfRange}
            testID={testID}
          />
          {sliderHint != null && (
            <ThemedText type="small" themeColor="textTertiary">
              {sliderHint}
            </ThemedText>
          )}
        </View>
      )}
    </FormRow>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  input: {
    width: 64,
    height: 44,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 16,
    textAlign: 'center',
  },
  value: {
    marginLeft: 'auto',
    fontSize: 16,
  },
  clear: {
    width: 44,
    height: 44,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderBlock: {
    gap: Spacing.one,
  },
});
