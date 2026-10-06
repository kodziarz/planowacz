import { Host, Slider } from '@expo/ui';
import { useColorScheme } from 'react-native';

import { Spacing } from '@/constants/theme';

export interface UiSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  testID?: string;
}

/** Native slider (@expo/ui) with a 5-minute-friendly stepped range. */
export function UiSlider({
  value,
  onValueChange,
  min = 0,
  max = 1,
  step,
  disabled,
  testID,
}: UiSliderProps) {
  const scheme = useColorScheme();
  const colorScheme = scheme === 'unspecified' ? undefined : scheme;

  return (
    <Host
      matchContents={{ vertical: true }}
      colorScheme={colorScheme}
      style={styles.host}>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        testID={testID}
      />
    </Host>
  );
}

const styles = {
  host: {
    width: '100%',
    marginHorizontal: 16,
    paddingVertical: Spacing.one,
  },
} as const;
