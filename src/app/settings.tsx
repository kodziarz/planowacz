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
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const exportData = async () => {
    setExportNotice(null);
    try {
      const payload = buildExportPayload({ tasks, categories, situations, notes, settings });
      const json = JSON.stringify(payload, null, 2);
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = EXPORT_FILE_NAME;
        anchor.click();
        URL.revokeObjectURL(url);
        return;
      }
      const file = new File(Paths.cache, EXPORT_FILE_NAME);
      if (file.exists) file.delete();
      file.create();
      file.write(json);
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setExportNotice(t('settings.exportUnavailable'));
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: t('settings.export'),
      });
    } catch {
      setExportNotice(t('settings.exportFailed'));
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
          <AppButton
            label={t('settings.import')}
            variant="secondary"
            onPress={() => router.push('/import')}
            testID="settings-import"
            style={styles.dataButton}
          />
        </View>
        {exportNotice != null && (
          <ThemedText type="small" themeColor="danger" style={styles.exportNotice}>
            {exportNotice}
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
