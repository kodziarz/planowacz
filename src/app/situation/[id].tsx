import { Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { SituationForm } from '@/components/situation-form';
import { useI18n } from '@/i18n';

export default function EditSituationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();
  const situationId = typeof id === 'string' ? id : undefined;

  return (
    <>
      <Stack.Screen options={{ title: t('situations.edit') }} />
      <Screen underHeader>
        {situationId != null && <SituationForm situationId={situationId} />}
      </Screen>
    </>
  );
}
