import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { useI18n } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';

/**
 * Colorblind-friendly marker for suggestions with violations:
 * a distinct circular badge with "!" (shape, not color alone) plus an
 * amber border applied by the task card.
 */
export function ViolationMarker() {
  const theme = useTheme();
  const { t } = useI18n();

  return (
    <View
      accessible
      accessibilityLabel={t('availability.marked')}
      style={[styles.badge, { backgroundColor: theme.warningBg, borderColor: theme.warningBorder }]}>
      <ThemedText type="smallBold" style={{ color: theme.warningText }}>
        {t('availability.markBadge')}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
