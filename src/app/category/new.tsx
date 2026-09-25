import { Stack } from 'expo-router';

import { CategoryForm } from '@/components/category-form';
import { Screen } from '@/components/screen';
import { useI18n } from '@/i18n';

export default function NewCategoryRoute() {
  const { t } = useI18n();

  return (
    <>
      <Stack.Screen options={{ title: t('categories.new') }} />
      <Screen underHeader>
        <CategoryForm />
      </Screen>
    </>
  );
}
