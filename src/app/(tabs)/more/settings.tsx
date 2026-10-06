import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { AppButton } from '@/components/button';
import { FormRow } from '@/components/form-row';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { UiSlider } from '@/components/ui-slider';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { buildExportPayload } from '@/logic/data-transfer';
import { useStore } from '@/store/store-provider';
import type { LanguageSetting } from '@/types';
import { formatDays, formatPercent } from '@/utils/format';
import { saveTextFile } from '@/utils/save-file';

const EXPORT_FILE_NAME = 'planowacz-export.json';

const COEFFICIENT_MIN = 0.05;
const COEFFICIENT_MAX = 1;
const COEFFICIENT_STEP = 0.05;
const PERIOD_MIN = 1;
const PERIOD_MAX = 365;

const LANGUAGES: {
  value: LanguageSetting;
  labelKey: 'settings.language.system' | 'settings.language.en' | 'settings.language.pl';
}[] = [
  { value: 'system', labelKey: 'settings.language.system' },
  { value: 'en', labelKey: 'settings.language.en' },
  { value: 'pl', labelKey: 'settings.language.pl' },
];

export default function SettingsScreen() {
  const { settings, updateSettings, tasks, categories, situations, notes } = useStore();
  const { t, locale } = useI18n();
  const theme = useTheme();
  const router = useRouter();
  const [notice, setNotice] = useState<{ text: string; tone: 'danger' | 'success' } | null>(null);

  const buildJson = () =>
    JSON.stringify(buildExportPayload({ tasks, categories, situations, notes, settings }), null, 2);

  const exportData = async () => {
    setNotice(null);
    try {
      const json = buildJson();
      if (Platform.OS === 'web') {
        const outcome = await saveTextFile(json, EXPORT_FILE_NAME);
        if (outcome !== 'saved') setNotice({ text: t('settings.exportFailed'), tone: 'danger' });
        return;
      }
      const file = new File(Paths.cache, EXPORT_FILE_NAME);
      if (file.exists) file.delete();
      file.create();
      file.write(json);
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setNotice({ text: t('settings.exportUnavailable'), tone: 'danger' });
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: t('settings.export'),
      });
    } catch {
      setNotice({ text: t('settings.exportFailed'), tone: 'danger' });
    }
  };

  const saveData = async () => {
    setNotice(null);
    try {
      const outcome = await saveTextFile(buildJson(), EXPORT_FILE_NAME);
      if (outcome === 'saved') setNotice({ text: t('settings.saveSucceeded'), tone: 'success' });
      else if (outcome === 'failed') setNotice({ text: t('settings.exportFailed'), tone: 'danger' });
    } catch {
      setNotice({ text: t('settings.exportFailed'), tone: 'danger' });
    }
  };

  return (
    <Screen title={t('tab.settings')} back>
      <FormRow
        label={t('settings.priorityCoefficient')}
        hint={t('settings.priorityCoefficientExplain')}>
        <ThemedText type="smallBold" style={styles.value}>
          {formatPercent(settings.priorityCoefficient, locale)}
        </ThemedText>
        <UiSlider
          value={settings.priorityCoefficient}
          onValueChange={(v) => {
            const rounded = Math.round(v / COEFFICIENT_STEP) * COEFFICIENT_STEP;
            updateSettings({
              priorityCoefficient: Math.min(
                COEFFICIENT_MAX,
                Math.max(COEFFICIENT_MIN, Number(rounded.toFixed(2))),
              ),
            });
          }}
          min={COEFFICIENT_MIN}
          max={COEFFICIENT_MAX}
          step={COEFFICIENT_STEP}
          testID="settings-coefficient"
        />
      </FormRow>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <FormRow label={t('settings.referencePeriod')} hint={t('settings.referencePeriodExplain')}>
        <ThemedText type="smallBold" style={styles.value}>
          {formatDays(settings.priorityReferencePeriodDays, t)}
        </ThemedText>
        <UiSlider
          value={settings.priorityReferencePeriodDays}
          onValueChange={(v) => updateSettings({ priorityReferencePeriodDays: Math.round(v) })}
          min={PERIOD_MIN}
          max={PERIOD_MAX}
          step={1}
          testID="settings-period"
        />
      </FormRow>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <FormRow label={t('settings.uiLanguage')} hint={t('settings.languageExplain')}>
        <View style={styles.chips}>
          {LANGUAGES.map(({ value, labelKey }) => {
            const selected = settings.language === value;
            return (
              <Pressable
                key={value}
                onPress={() => updateSettings({ language: value })}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    borderColor: selected ? theme.accent : theme.border,
                    backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <ThemedText
                  type="small"
                  themeColor={selected ? 'text' : 'textSecondary'}
                  style={selected ? styles.chipSelected : undefined}>
                  {t(labelKey)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </FormRow>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <FormRow label={t('settings.data')} hint={t('settings.dataExplain')}>
        <View style={styles.dataButtons}>
          <AppButton
            label={t('settings.export')}
            variant="secondary"
            onPress={() => {
              void exportData();
            }}
            testID="settings-export"
            style={styles.dataButton}
          />
          {Platform.OS !== 'web' && (
            <AppButton
              label={t('settings.save')}
              variant="secondary"
              onPress={() => {
                void saveData();
              }}
              testID="settings-save"
              style={styles.dataButton}
            />
          )}
          <AppButton
            label={t('settings.import')}
            variant="secondary"
            onPress={() => router.push('/more/import')}
            testID="settings-import"
            style={styles.dataButton}
          />
        </View>
        {notice != null && (
          <ThemedText type="small" themeColor={notice.tone} style={styles.exportNotice}>
            {notice.text}
          </ThemedText>
        )}
      </FormRow>
    </Screen>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: 24,
  },
  divider: {
    height: 1,
    opacity: 0.6,
  },
  chips: {
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
  chipSelected: {
    fontWeight: '700',
  },
  dataButtons: {
    gap: Spacing.two,
  },
  dataButton: {
    alignSelf: 'flex-start',
  },
  exportNotice: {
    marginTop: Spacing.two,
  },
});
