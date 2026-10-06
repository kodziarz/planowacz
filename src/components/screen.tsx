import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = ViewProps & {
  title?: string;
  scroll?: boolean;
  /** Use when the screen sits under a native stack header (forms) — skips the top inset. */
  underHeader?: boolean;
  /** Shows a back button when there is history to go back to (stack screens). */
  back?: boolean;
};

const WEB_BOTTOM = BottomTabInset + Spacing.four;

function BackButton() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useI18n();
  if (!router.canGoBack()) return null;
  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      style={({ pressed }) => [
        styles.backButton,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}>
      <ThemedText type="smallBold" themeColor="text">
        ← {t('common.back')}
      </ThemedText>
    </Pressable>
  );
}

export function Screen({ title, scroll = true, underHeader = false, back = false, children, style, ...rest }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.content, style]} {...rest}>
      {back && <BackButton />}
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
  backButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    minHeight: 36,
    justifyContent: 'center',
  },
});
