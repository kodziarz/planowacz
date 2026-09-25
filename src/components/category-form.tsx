import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from './button';
import { CategorySwatches } from './category-swatches';
import { FormRow } from './form-row';
import { TextField } from './text-field';
import { ThemedText } from './themed-text';

import { DEFAULT_CATEGORY_COLOR } from '@/constants/palette';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/store-provider';
import { confirmAction } from '@/utils/confirm';

export interface CategoryFormProps {
  /** When set, the form edits this category. */
  categoryId?: string;
}

export function CategoryForm({ categoryId }: CategoryFormProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const { t } = useI18n();
  const theme = useTheme();
  const router = useRouter();

  const existing = categoryId != null ? (categories.find((c) => c.id === categoryId) ?? null) : null;
  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? DEFAULT_CATEGORY_COLOR);
  const [nameError, setNameError] = useState<string | null>(null);

  const missing = categoryId != null && existing == null;
  useEffect(() => {
    if (missing) router.back();
  }, [missing, router]);

  if (missing) return null;

  const save = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setNameError(t('categories.nameRequired'));
      return;
    }
    if (existing != null) {
      updateCategory(existing.id, { name: trimmed, color });
    } else {
      addCategory({ name: trimmed, color });
    }
    router.back();
  };

  const remove = async () => {
    if (existing == null) return;
    const ok = await confirmAction(
      t('categories.deleteTitle'),
      t('categories.deleteMessage'),
      t('common.delete'),
      t('common.cancel'),
    );
    if (ok) {
      deleteCategory(existing.id);
      router.back();
    }
  };

  return (
    <View style={styles.form}>
      <TextField
        label={t('categories.name')}
        value={name}
        onChangeText={(value) => {
          setName(value);
          setNameError(null);
        }}
        placeholder={t('categories.namePlaceholder')}
        error={nameError != null}
      />
      {nameError != null && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {nameError}
        </ThemedText>
      )}

      <FormRow label={t('categories.color')}>
        <CategorySwatches value={color} onChange={setColor} />
      </FormRow>

      <AppButton label={t('common.save')} onPress={save} />

      {existing != null && (
        <AppButton label={t('common.delete')} variant="danger" onPress={() => void remove()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
});
