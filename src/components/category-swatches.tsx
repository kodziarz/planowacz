import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { CATEGORY_PALETTE } from '@/constants/palette';
import { useTheme } from '@/hooks/use-theme';

export function CategorySwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {CATEGORY_PALETTE.map((color) => {
        const selected = color.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={color}
            style={[
              styles.swatch,
              {
                backgroundColor: color,
                borderColor: selected ? theme.accent : theme.border,
                borderWidth: selected ? 3 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
