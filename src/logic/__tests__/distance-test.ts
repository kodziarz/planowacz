import { haversineKm, sortSituations } from '../distance';

import type { Situation } from '@/types';

const NOW = 1_700_000_000_000;

function situation(overrides: Partial<Situation> & Pick<Situation, 'id'>): Situation {
  return {
    name: overrides.id,
    description: null,
    localization: null,
    latitude: null,
    longitude: null,
    createdAt: NOW,
    ...overrides,
  };
}

describe('haversineKm', () => {
  test('zero for the same point', () => {
    expect(haversineKm({ latitude: 52.23, longitude: 21.01 }, { latitude: 52.23, longitude: 21.01 })).toBe(0);
  });

  test('Warsaw → Kraków ≈ 250 km', () => {
    const warsaw = { latitude: 52.2297, longitude: 21.0122 };
    const krakow = { latitude: 50.0647, longitude: 19.945 };
    const km = haversineKm(warsaw, krakow);
    expect(km).toBeGreaterThan(240);
    expect(km).toBeLessThan(270);
  });
});

describe('sortSituations', () => {
  const older = situation({ id: 'a', name: 'Zoo', createdAt: NOW - 2000 });
  const newer = situation({ id: 'b', name: 'Airport', createdAt: NOW - 1000 });
  const far = situation({
    id: 'c',
    name: 'Cafe',
    createdAt: NOW,
    latitude: 50.0647,
    longitude: 19.945,
  });
  const noCoords = situation({ id: 'd', name: 'Home', createdAt: NOW - 500, localization: 'somewhere' });

  test('creation mode: older first', () => {
    const result = sortSituations([newer, older], 'creation');
    expect(result.map((s) => s.id)).toEqual(['a', 'b']);
  });

  test('name mode: alphabetical, tie by creation', () => {
    const result = sortSituations([older, newer, far], 'name');
    expect(result.map((s) => s.name)).toEqual(['Airport', 'Cafe', 'Zoo']);
  });

  test('distance mode: closest first, no-coords last', () => {
    const warsaw = { latitude: 52.2297, longitude: 21.0122 };
    const result = sortSituations([far, noCoords, newer, older], 'distance', warsaw);
    // Only `c` has coordinates → first; the rest keep creation order at the end.
    expect(result.map((s) => s.id)).toEqual(['c', 'a', 'b', 'd']);
  });

  test('distance mode without a reference falls back to creation order', () => {
    const result = sortSituations([newer, older], 'distance', null);
    expect(result.map((s) => s.id)).toEqual(['a', 'b']);
  });
});
