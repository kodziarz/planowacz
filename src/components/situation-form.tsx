import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AddressSuggestions } from './address-suggestions';
import { AppButton } from './button';
import { TextField } from './text-field';
import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/store-provider';
import { confirmAction } from '@/utils/confirm';
import { formatDateTime } from '@/utils/format';
import {
  type GeoPoint,
  getCurrentPoint,
  geocodeAddress,
  reverseGeocodeLabel,
} from '@/utils/location';

export interface SituationFormProps {
  /** When set, the form edits this situation. */
  situationId?: string;
}

export function SituationForm({ situationId }: SituationFormProps) {
  const { situations, notes, addSituation, updateSituation, deleteSituation } = useStore();
  const { t, locale } = useI18n();
  const theme = useTheme();
  const router = useRouter();

  const existing =
    situationId != null ? (situations.find((situation) => situation.id === situationId) ?? null) : null;
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [localization, setLocalization] = useState(existing?.localization ?? '');
  const [coords, setCoords] = useState<GeoPoint | null>(
    existing?.latitude != null && existing?.longitude != null
      ? { latitude: existing.latitude, longitude: existing.longitude }
      : null,
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const missing = situationId != null && existing == null;
  useEffect(() => {
    if (missing) router.back();
  }, [missing, router]);

  if (missing) return null;

  const situationNotes =
    existing != null
      ? notes
          .filter((note) => note.situationId === existing.id)
          .sort((a, b) => a.createdAt - b.createdAt)
      : [];

  const locateByGps = async () => {
    const point = await getCurrentPoint();
    if (point == null) {
      setNotice(t('situations.permissionDenied'));
      return;
    }
    setCoords(point);
    const label = await reverseGeocodeLabel(point);
    if (label != null) setLocalization(label);
    setNotice(null);
  };

  const save = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setNameError(t('situations.nameRequired'));
      return;
    }
    const trimmedLocation = localization.trim();
    const trimmedDescription = description.trim();
    let point = coords;
    if (point == null && trimmedLocation.length > 0) {
      point = await geocodeAddress(trimmedLocation);
    }
    const payload = {
      name: trimmedName,
      description: trimmedDescription.length > 0 ? trimmedDescription : null,
      localization: trimmedLocation.length > 0 ? trimmedLocation : null,
      latitude: point?.latitude ?? null,
      longitude: point?.longitude ?? null,
    };
    if (existing != null) updateSituation(existing.id, payload);
    else addSituation(payload);
    router.back();
  };

  const remove = async () => {
    if (existing == null) return;
    const noteCount = situationNotes.length;
    const message =
      noteCount > 0
        ? `${t('situations.deleteNotesMessage', { count: noteCount })}\n${t('situations.deleteMessage')}`
        : t('situations.deleteMessage');
    const ok = await confirmAction(
      t('situations.deleteTitle'),
      message,
      t('common.delete'),
      t('common.cancel'),
    );
    if (ok) {
      deleteSituation(existing.id);
      router.back();
    }
  };

  return (
    <View style={styles.form}>
      <TextField
        label={t('situations.name')}
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (nameError != null) setNameError(null);
        }}
        placeholder={t('situations.namePlaceholder')}
        error={nameError != null}
      />
      {nameError != null && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {nameError}
        </ThemedText>
      )}

      <TextField
        label={t('situations.description')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('situations.descriptionPlaceholder')}
        multiline
      />

      <TextField
        label={t('situations.localization')}
        value={localization}
        onChangeText={(value) => {
          setLocalization(value);
          setCoords(null);
        }}
        placeholder={t('situations.localizationPlaceholder')}
      />
      <AddressSuggestions
        query={localization}
        lang={locale}
        onSelect={(suggestion) => {
          setLocalization(suggestion.label);
          setCoords(suggestion.point);
        }}
      />
      <AppButton label={t('situations.gps')} variant="secondary" onPress={() => void locateByGps()} />

      {notice != null && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {notice}
        </ThemedText>
      )}

      {existing != null && (
        <ThemedText type="small" themeColor="textTertiary">
          {t('situations.created', { date: formatDateTime(existing.createdAt, locale) })}
        </ThemedText>
      )}

      {existing != null && (
        <View style={styles.notes}>
          <ThemedText type="smallBold">{t('situations.notes')}</ThemedText>
          {situationNotes.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('notes.empty')}
            </ThemedText>
          ) : (
            situationNotes.map((note) => (
              <Pressable
                key={note.id}
                onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.noteRow,
                  {
                    backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}>
                <ThemedText type="small" numberOfLines={1}>
                  {note.name}
                </ThemedText>
              </Pressable>
            ))
          )}
          <AppButton
            label={t('notes.new')}
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/note/new', params: { situationId: existing.id } })
            }
          />
        </View>
      )}

      <AppButton label={t('common.save')} onPress={() => void save()} />

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
  notes: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  noteRow: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
    minHeight: 44,
    justifyContent: 'center',
  },
});
