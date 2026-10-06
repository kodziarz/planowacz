import { en } from '../en';
import { pl } from '../pl';

function flatten(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  if (value == null || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    flatten(child, `${prefix}${key}.`),
  );
}

describe('i18n dictionaries', () => {
  test('pl and en expose the same keys', () => {
    const enKeys = new Set(flatten(en).map((key) => key.slice(0, -1)));
    const plKeys = new Set(flatten(pl).map((key) => key.slice(0, -1)));

    const missingInPl = [...enKeys].filter((key) => !plKeys.has(key));
    const missingInEn = [...plKeys].filter((key) => !enKeys.has(key));

    expect(missingInPl).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  test('pl translations keep every interpolation placeholder from en', () => {
    const enFlat = Object.fromEntries(
      flatten(en).map((path) => {
        const leaf = path
          .split('.')
          .slice(0, -1)
          .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], en);
        return [path, leaf as string];
      }),
    );
    const plFlat = Object.fromEntries(
      flatten(pl).map((path) => {
        const leaf = path
          .split('.')
          .slice(0, -1)
          .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], pl);
        return [path, leaf as string];
      }),
    );

    const placeholders = (text: string) =>
      [...text.matchAll(/%\{(\w+)\}/g)].map((match) => match[1]).sort();

    for (const [path, enText] of Object.entries(enFlat)) {
      const plText = plFlat[path];
      if (plText == null) {
        expect(plText).toBeDefined();
        continue;
      }
      expect({ path, placeholders: placeholders(plText) }).toEqual({
        path,
        placeholders: placeholders(enText),
      });
    }
  });
});
