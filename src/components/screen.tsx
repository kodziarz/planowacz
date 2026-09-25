import { Platform, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = ViewProps & {
  title?: string;
  scroll?: boolean;
  /** Use when the screen sits under a native stack header (forms) — skips the top inset. */
  underHeader?: boolean;
};

const WEB_BOTTOM = BottomTabInset + Spacing.four;

export function Screen({ title, scroll = true, underHeader = false, children, style, ...rest }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.content, style]} {...rest}>
      {title != null && <ThemedText type="subtitle">{title}</ThemedText>}
      {children}
    </View>
  );

  if (!scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        {content}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: underHeader
            ? Spacing.four
            : Platform.OS === 'android'
              ? Spacing.four
              : insets.top + Spacing.three,
          paddingBottom: Platform.select({ web: WEB_BOTTOM, default: Spacing.four }),
        },
      ]}>
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
