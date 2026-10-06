import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/store-provider';

export default function CategoriesScreen() {
  const { tasks, categories } = useStore();
  const { t } = useI18n();
  const theme = useTheme();
  const router = useRouter();

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      if (task.categoryId != null) {
        map.set(task.categoryId, (map.get(task.categoryId) ?? 0) + 1);
      }
    }
    return map;
  }, [tasks]);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.createdAt - b.createdAt),
    [categories],
  );

  return (
    <Screen title={t('tab.categories')} back>
      <AppButton label={t('categories.new')} onPress={() => router.push('/category/new')} />

      {sorted.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('categories.empty')}
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {sorted.map((category) => (
            <Pressable
              key={category.id}
              onPress={() =>
                router.push({ pathname: '/category/[id]', params: { id: category.id } })
              }
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <View style={[styles.swatch, { backgroundColor: category.color }]} />
              <View style={styles.info}>
                <ThemedText type="smallBold">{category.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('categories.tasksUsing', { count: counts.get(category.id) ?? 0 })}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    minHeight: 56,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
