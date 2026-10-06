import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n, type TranslationKey } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';

type MenuEntry = {
  labelKey: TranslationKey;
  href: '/more/queues' | '/more/categories' | '/more/statistics' | '/more/settings';
};

const ENTRIES: MenuEntry[] = [
  { labelKey: 'tab.queues', href: '/more/queues' },
  { labelKey: 'tab.categories', href: '/more/categories' },
  { labelKey: 'tab.statistics', href: '/more/statistics' },
  { labelKey: 'tab.settings', href: '/more/settings' },
];

export default function MoreScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen title={t('more.title')}>
      <View style={styles.list}>
        {ENTRIES.map((entry) => (
          <Pressable
            key={entry.href}
            onPress={() => router.push(entry.href)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <ThemedText type="smallBold">{t(entry.labelKey)}</ThemedText>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    minHeight: 56,
    justifyContent: 'center',
  },
});
