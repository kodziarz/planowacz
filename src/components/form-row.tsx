import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface FormRowProps extends ViewProps {
  label?: string;
  hint?: string;
  error?: string;
}

export function FormRow({ label, hint, error, children, style, ...rest }: FormRowProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, style]} {...rest}>
      {label != null && <ThemedText type="smallBold">{label}</ThemedText>}
      {children}
      {hint != null && (
        <ThemedText type="small" themeColor="textTertiary">
          {hint}
        </ThemedText>
      )}
      {error != null && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
});
