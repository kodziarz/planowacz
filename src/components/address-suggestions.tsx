import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  MIN_QUERY_LENGTH,
  type AddressSuggestion,
  suggestAddresses,
} from '@/utils/address-lookup';

/** How long the input has to stay still before the online lookup runs. */
const DEBOUNCE_MS = 350;

export interface AddressSuggestionsProps {
  /** The text currently typed into the address field. */
  query: string;
  /** BCP 47 language used to label the suggestions. */
  lang?: string;
  onSelect: (suggestion: AddressSuggestion) => void;
}

/**
 * Few addresses matching the typed text, shown as a list of tappable prompts
 * right under an address field. Renders nothing while there is nothing to show.
 */
export function AddressSuggestions({ query, lang, onSelect }: AddressSuggestionsProps) {
  const theme = useTheme();
  const [result, setResult] = useState<{ query: string; items: AddressSuggestion[] }>({
    query: '',
    items: [],
  });
  const [picked, setPicked] = useState<string | null>(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH || trimmed === picked) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      suggestAddresses(trimmed, { lang })
        .then((items) => {
          if (!cancelled) setResult({ query: trimmed, items });
        })
        .catch(() => {
          if (!cancelled) setResult({ query: trimmed, items: [] });
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, lang, picked]);

  const suggestions = result.query === trimmed ? result.items : [];
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.list}>
      {suggestions.map((suggestion, index) => (
        <Pressable
          key={`${suggestion.label}#${index}`}
          onPress={() => {
            setPicked(suggestion.label);
            onSelect(suggestion);
          }}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <ThemedText type="small" numberOfLines={2}>
            {suggestion.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.one,
    marginTop: -Spacing.one,
  },
  row: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    minHeight: 44,
    justifyContent: 'center',
  },
});
