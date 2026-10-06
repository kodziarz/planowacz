import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from './button';
import { TextField } from './text-field';
import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/store-provider';
import { confirmAction } from '@/utils/confirm';
import { formatDateTime } from '@/utils/format';

export interface NoteFormProps {
  /** When set, the form edits this note. */
  noteId?: string;
  /** Situation the new note belongs to (create mode). */
  situationId?: string;
}

export function NoteForm({ noteId, situationId }: NoteFormProps) {
  const { notes, situations, addNote, updateNote, deleteNote } = useStore();
  const { t, locale } = useI18n();
  const theme = useTheme();
  const router = useRouter();

  const existing = noteId != null ? (notes.find((note) => note.id === noteId) ?? null) : null;
  const targetSituationId = existing?.situationId ?? situationId ?? null;
  const situation = situations.find((item) => item.id === targetSituationId) ?? null;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [nameError, setNameError] = useState<string | null>(null);

  const invalid =
    (noteId != null && existing == null) || targetSituationId == null || situation == null;
  useEffect(() => {
    if (invalid) router.back();
  }, [invalid, router]);

  if (invalid) return null;

  const save = () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      setNameError(t('notes.nameRequired'));
      return;
    }
    const trimmedDescription = description.trim();
    const payload = {
      name: trimmedName,
      description: trimmedDescription.length > 0 ? trimmedDescription : null,
    };
    if (existing != null) {
      updateNote(existing.id, payload);
    } else {
      addNote({ ...payload, situationId: targetSituationId! });
    }
    router.back();
  };

  const remove = async () => {
    if (existing == null) return;
    const ok = await confirmAction(
      t('notes.deleteTitle'),
      t('notes.deleteMessage'),
      t('common.delete'),
      t('common.cancel'),
    );
    if (ok) {
      deleteNote(existing.id);
      router.back();
    }
  };

  return (
    <View style={styles.form}>
      <ThemedText type="small" themeColor="textSecondary">
        {t('notes.inSituation', { name: situation.name })}
      </ThemedText>

      <TextField
        label={t('notes.name')}
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (nameError != null) setNameError(null);
        }}
        placeholder={t('notes.namePlaceholder')}
        error={nameError != null}
      />
      {nameError != null && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {nameError}
        </ThemedText>
      )}

      <TextField
        label={t('notes.description')}
        value={description}
        onChangeText={setDescription}
        placeholder={t('notes.descriptionPlaceholder')}
        multiline
      />

      {existing != null && (
        <ThemedText type="small" themeColor="textTertiary">
          {t('notes.created', { date: formatDateTime(existing.createdAt, locale) })}
        </ThemedText>
      )}

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
