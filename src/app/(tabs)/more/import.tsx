import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useI18n, type TranslationKey } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import {
  computeImport,
  DEFAULT_IMPORT_FLAGS,
  ExportParseError,
  parseExportPayload,
  type ExportPayload,
  type ImportFlags,
  type TypeFlags,
} from '@/logic/data-transfer';
import { useStore } from '@/store/store-provider';
import { formatDays, formatPercent } from '@/utils/format';

type ObjectType = 'tasks' | 'categories' | 'situations' | 'notes';

const OBJECT_TYPES: ObjectType[] = ['tasks', 'categories', 'situations', 'notes'];

const TYPE_LABEL_KEYS: Record<ObjectType, TranslationKey> = {
  tasks: 'import.types.tasks',
  categories: 'import.types.categories',
  situations: 'import.types.situations',
  notes: 'import.types.notes',
};

const PARSE_ERROR_KEYS: Record<string, TranslationKey> = {
  'not json': 'import.errorNotJson',
  'not an object': 'import.errorNotJson',
  'foreign app': 'import.errorForeign',
  'newer schema': 'import.errorNewer',
  'missing data': 'import.errorShape',
};

function initialFlags(): ImportFlags {
  return {
    tasks: { ...DEFAULT_IMPORT_FLAGS.tasks },
    categories: { ...DEFAULT_IMPORT_FLAGS.categories },
    situations: { ...DEFAULT_IMPORT_FLAGS.situations },
    notes: { ...DEFAULT_IMPORT_FLAGS.notes },
    settings: DEFAULT_IMPORT_FLAGS.settings,
  };
}

function decodeBase64(value: string): string {
  const comma = value.indexOf(',');
  const data = comma >= 0 && value.slice(0, comma).includes(';base64') ? value.slice(comma + 1) : value;
  const binary = atob(data);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function readAssetText(asset: DocumentPicker.DocumentPickerAsset): Promise<string> {
  if (asset.file != null) return await asset.file.text();
  if (asset.base64 != null) return decodeBase64(asset.base64);
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    return await response.text();
  }
  return await new File(asset.uri).text();
}

function ToggleChip({
  label,
  selected,
  onToggle,
  testID,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  testID?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      testID={testID}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? theme.accent : theme.border,
          backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function ImportScreen() {
  const { tasks, categories, situations, notes, settings, applyImport } = useStore();
  const { t, locale } = useI18n();
  const theme = useTheme();
  const router = useRouter();
  const [payload, setPayload] = useState<ExportPayload | null>(null);
  const [flags, setFlags] = useState<ImportFlags>(initialFlags);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickFile = async () => {
    setError(null);
    setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (result.canceled || result.assets == null || result.assets.length === 0) return;
      const text = await readAssetText(result.assets[0]);
      setFlags(initialFlags());
      setPayload(parseExportPayload(text));
    } catch (e) {
      setPayload(null);
      if (e instanceof ExportParseError) {
        setError(t(PARSE_ERROR_KEYS[e.message] ?? 'import.errorShape'));
      } else {
        setError(t('import.readFailed'));
      }
    } finally {
      setBusy(false);
    }
  };

  const setTypeFlag = (type: ObjectType, key: keyof TypeFlags) => {
    setFlags((prev) => ({ ...prev, [type]: { ...prev[type], [key]: !prev[type][key] } }));
  };

  const runImport = () => {
    if (payload == null) return;
    const result = computeImport({ tasks, categories, situations, notes, settings }, payload, flags);
    applyImport(result);
    router.back();
  };

  const anythingSelected =
    flags.settings ||
    OBJECT_TYPES.some((type) => flags[type].add || flags[type].remove);

  return (
    <Screen title={t('import.title')} back>
      <ThemedText type="small" themeColor="textSecondary">
        {t('import.intro')}
      </ThemedText>

      <AppButton
        label={busy ? t('import.choosing') : t('import.choose')}
        variant="secondary"
        loading={busy}
        onPress={() => {
          void pickFile();
        }}
        testID="import-choose"
      />

      {error != null && (
        <ThemedText type="small" themeColor="danger" testID="import-error">
          {error}
        </ThemedText>
      )}

      {payload != null && (
        <View style={styles.review}>
          <ThemedText type="smallBold">{t('import.review')}</ThemedText>

          {payload.data.tasks.length +
            payload.data.categories.length +
            payload.data.situations.length +
            payload.data.notes.length ===
            0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('import.emptyFile')}
            </ThemedText>
          )}

          {OBJECT_TYPES.map((type) => {
            const fileCount = payload.data[type].length;
            const currentCount = type === 'tasks' ? tasks.length
              : type === 'categories' ? categories.length
              : type === 'situations' ? situations.length
              : notes.length;
            const typeFlags: TypeFlags = flags[type];
            return (
              <View key={type} style={[styles.row, { borderBottomColor: theme.border }]}>
                <ThemedText type="smallBold">{t(TYPE_LABEL_KEYS[type])}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('import.currentCount', { count: currentCount })} ·{' '}
                  {t('import.fileCount', { count: fileCount })}
                </ThemedText>
                <View style={styles.toggles}>
                  <ToggleChip
                    label={t('import.add')}
                    selected={typeFlags.add}
                    onToggle={() => setTypeFlag(type, 'add')}
                    testID={`import-add-${type}`}
                  />
                  <ToggleChip
                    label={t('import.remove')}
                    selected={typeFlags.remove}
                    onToggle={() => setTypeFlag(type, 'remove')}
                    testID={`import-remove-${type}`}
                  />
                </View>
              </View>
            );
          })}

          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <ThemedText type="smallBold">{t('import.types.settings')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('import.currentValue', {
                value: t('import.settingsValue', {
                  coefficient: formatPercent(settings.priorityCoefficient, locale),
                  days: formatDays(settings.priorityReferencePeriodDays, t),
                }),
              })}{' '}
              ·{' '}
              {t('import.fileValue', {
                value: t('import.settingsValue', {
                  coefficient: formatPercent(payload.data.settings.priorityCoefficient, locale),
                  days: formatDays(payload.data.settings.priorityReferencePeriodDays, t),
                }),
              })}
            </ThemedText>
            <View style={styles.toggles}>
              <ToggleChip
                label={t('import.replaceSettings')}
                selected={flags.settings}
                onToggle={() => setFlags((prev) => ({ ...prev, settings: !prev.settings }))}
                testID="import-replace-settings"
              />
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton
              label={t('import.apply')}
              onPress={runImport}
              disabled={!anythingSelected}
              testID="import-apply"
              style={styles.actionButton}
            />
            <AppButton
              label={t('common.cancel')}
              variant="secondary"
              onPress={() => router.back()}
              testID="import-cancel"
              style={styles.actionButton}
            />
          </View>
          {!anythingSelected && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('import.nothingSelected')}
            </ThemedText>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  review: {
    gap: Spacing.two,
    width: '100%',
  },
  row: {
    gap: Spacing.one,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggles: {
    flexDirection: 'row',
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionButton: {
    flex: 1,
  },
});
