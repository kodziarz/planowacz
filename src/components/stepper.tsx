import { Pressable, StyleSheet, View } from 'react-native';

import { FormRow } from './form-row';
import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';

function StepButton({
  symbol,
  label,
  onPress,
  disabled,
}: {
  symbol: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.stepButton,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}>
      <ThemedText type="smallBold" style={{ fontSize: 18 }}>
        {symbol}
      </ThemedText>
    </Pressable>
  );
}

export interface NumberStepperProps {
  label?: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
}

export function NumberStepper({
  label,
  hint,
  value,
  onChange,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  format,
}: NumberStepperProps) {
  const { t } = useI18n();
  return (
    <FormRow label={label} hint={hint}>
      <View style={styles.row}>
        <StepButton
          symbol="−"
          label={t('a11y.decrease')}
          onPress={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
        />
        <ThemedText type="smallBold" style={styles.value}>
          {format ? format(value) : String(value)}
        </ThemedText>
        <StepButton
          symbol="+"
          label={t('a11y.increase')}
          onPress={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
        />
      </View>
    </FormRow>
  );
}


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 96,
    textAlign: 'center',
    fontSize: 16,
  },
});
