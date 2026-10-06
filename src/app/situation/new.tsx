import { Stack } from 'expo-router';

import { Screen } from '@/components/screen';
import { SituationForm } from '@/components/situation-form';
import { useI18n } from '@/i18n';

export default function NewSituationRoute() {
  const { t } = useI18n();

  return (
    <>
      <Stack.Screen options={{ title: t('situations.new') }} />
      <Screen underHeader>
        <SituationForm />
      </Screen>
    </>
  );
}
