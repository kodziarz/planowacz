import { Circle, G, Path, Svg, Text as SvgText } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface PieSlice {
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieSlice[];
  size?: number;
  /** Optional text drawn in the middle (e.g. the formatted total). */
  centerLabel?: string;
}

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function slicePath(cx: number, cy: number, radius: number, startDeg: number, endDeg: number): string {
  const start = polar(cx, cy, radius, startDeg);
  const end = polar(cx, cy, radius, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

/** Hand-rolled donut-less pie chart (react-native-svg) — slices in input order. */
export function PieChart({ data, size = 180, centerLabel }: PieChartProps) {
  const theme = useTheme();
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0 || data.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  if (data.length === 1) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} fill={data[0].color} />
      </Svg>
    );
  }

  const paths = data.map((slice, index) => {
    const before = data.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    const start = (before / total) * 360;
    const end = ((before + slice.value) / total) * 360;
    return <Path key={index} d={slicePath(cx, cy, radius, start, end)} fill={slice.color} />;
  });

  return (
    <Svg width={size} height={size}>
      <G>{paths}</G>
      {centerLabel != null && (
        <SvgText
          x={cx}
          y={cy}
          fontSize={15}
          fontWeight="bold"
          fill={theme.text}
          textAnchor="middle"
          alignmentBaseline="middle">
          {centerLabel}
        </SvgText>
      )}
    </Svg>
  );
}

export interface PieLegendEntry {
  label: string;
  value: number;
  color: string;
  /** Pre-formatted percent of the total. */
  percent: string;
  /** Pre-formatted duration. */
  time: string;
}

export function PieLegend({ entries }: { entries: PieLegendEntry[] }) {
  return (
    <View style={styles.legend}>
      {entries.map((entry) => (
        <View key={entry.label} style={styles.legendRow}>
          <View style={[styles.swatch, { backgroundColor: entry.color }]} />
          <ThemedText type="small" style={styles.legendLabel} numberOfLines={1}>
            {entry.label}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {entry.time}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.percent}>
            {entry.percent}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    gap: Spacing.one,
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 0.5,
    borderColor: 'rgba(128,128,128,0.5)',
  },
  legendLabel: {
    flex: 1,
  },
  percent: {
    minWidth: 44,
    textAlign: 'right',
  },
});
