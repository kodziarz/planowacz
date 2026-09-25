import { Stack, useLocalSearchParams } from 'expo-router';

import { CategoryForm } from '@/components/category-form';
import { Screen } from '@/components/screen';
import { useI18n } from '@/i18n';

export default function EditCategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const categoryId = typeof id === 'string' ? id : undefined;

  return (
    <>
      <Stack.Screen options={{ title: t('categories.edit') }} />
      <Screen underHeader>
        {categoryId != null && <CategoryForm categoryId={categoryId} />}
      </Screen>
    </>
  );
}
