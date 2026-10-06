import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AddressSuggestions } from '@/components/address-suggestions';
import { AppButton } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { haversineKm, sortSituations } from '@/logic/distance';
import { useStore } from '@/store/store-provider';
import { formatKm } from '@/utils/format';
import { type GeoPoint, getCurrentPoint, geocodeAddress } from '@/utils/location';

type SortMode = 'creation' | 'name' | 'distance';

export default function SituationsScreen() {
  const { situations } = useStore();
  const { t, locale } = useI18n();
  const theme = useTheme();
  const router = useRouter();

  const [sortMode, setSortMode] = useState<SortMode>('creation');
  const [reference, setReference] = useState<GeoPoint | null>(null);
  const [address, setAddress] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const sorted = useMemo(
    () => sortSituations(situations, sortMode, reference),
    [situations, sortMode, reference],
  );

  const locateByAddress = async () => {
    const point = await geocodeAddress(address);
    if (point == null) {
      setNotice(t('situations.geocodeFailed'));
      return;
    }
    setReference(point);
    setNotice(null);
    setSortMode('distance');
  };

  const locateByGps = async () => {
    const point = await getCurrentPoint();
    if (point == null) {
      setNotice(t('situations.permissionDenied'));
      return;
    }
    setReference(point);
    setNotice(null);
    setSortMode('distance');
  };

  return (
    <Screen title={t('tab.situations')}>
      <AppButton label={t('situations.new')} onPress={() => router.push('/situation/new')} />

      <View style={styles.reference}>
        <TextField
          label={t('situations.reference')}
          value={address}
          onChangeText={setAddress}
          placeholder={t('situations.referencePlaceholder')}
        />
        <AddressSuggestions
          query={address}
          lang={locale}
          onSelect={(suggestion) => {
            setAddress(suggestion.label);
            setReference(suggestion.point);
            setNotice(null);
            setSortMode('distance');
          }}
        />
        <View style={styles.actions}>
          <AppButton
            label={t('situations.useAddress')}
            variant="secondary"
            onPress={() => void locateByAddress()}
            style={styles.flex}
          />
          <AppButton
            label={t('situations.gps')}
            variant="secondary"
            onPress={() => void locateByGps()}
            style={styles.flex}
          />
        </View>
        {notice != null && (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {notice}
          </ThemedText>
        )}
        {reference != null && (
          <ThemedText type="small" themeColor="textSecondary">
            {t('situations.referenceSet')}
          </ThemedText>
        )}
      </View>

      <View style={styles.sorts}>
        {(
          [
            { value: 'creation', labelKey: 'situations.sortNewest' },
            { value: 'name', labelKey: 'situations.sortName' },
            { value: 'distance', labelKey: 'situations.sortDistance' },
          ] as const
        ).map(({ value, labelKey }) => {
          const selected = sortMode === value;
          const disabled = value === 'distance' && reference == null;
          return (
            <Pressable
              key={value}
              onPress={() => !disabled && setSortMode(value)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              style={({ pressed }) => [
                styles.chip,
                {
                  borderColor: selected ? theme.accent : theme.border,
                  backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                  opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
                },
              ]}>
              <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                {t(labelKey)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {sorted.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('situations.empty')}
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {sorted.map((situation) => {
            const distance =
              reference != null && situation.latitude != null && situation.longitude != null
                ? haversineKm(reference, {
                    latitude: situation.latitude,
                    longitude: situation.longitude,
                  })
                : null;
            return (
              <Pressable
                key={situation.id}
                onPress={() =>
                  router.push({ pathname: '/situation/[id]', params: { id: situation.id } })
                }
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.info}>
                  <ThemedText type="smallBold">{situation.name}</ThemedText>
                  {situation.localization != null && (
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {situation.localization}
                    </ThemedText>
                  )}
                </View>
                {distance != null && (
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('situations.distance', { km: formatKm(distance, locale) })}
                  </ThemedText>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  reference: {
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  sorts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    minHeight: 36,
    justifyContent: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  flex: {
    flex: 1,
  },
});
