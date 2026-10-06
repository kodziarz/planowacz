import type { CSSProperties } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface DateTimeFieldProps {
  label: string;
  /** Selected moment (ms since epoch). */
  value: number;
  onChange: (value: number) => void;
  testID?: string;
}

/** Local-time value in the format expected by `<input type="datetime-local">`. */
function toInputValue(ms: number): string {
  const date = new Date(ms);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function DateTimeField({ label, value, onChange, testID }: DateTimeFieldProps) {
  const theme = useTheme();

  const inputStyle: CSSProperties = {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    fontSize: 16,
    width: '100%',
    color: theme.text,
    backgroundColor: theme.backgroundElement,
    borderColor: theme.border,
  };

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <input
        type="datetime-local"
        value={toInputValue(value)}
        aria-label={label}
        data-testid={testID}
        style={inputStyle}
        onChange={(event) => {
          const parsed = Date.parse(event.target.value);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
});
