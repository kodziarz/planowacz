import * as Location from 'expo-location';

import { getCurrentPoint, geocodeAddress, reverseGeocodeLabel } from '../location';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  geocodeAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

const mockLocation = Location as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
  mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
});

describe('getCurrentPoint', () => {
  test('returns the device coordinates when permission is granted', async () => {
    mockLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 52.23, longitude: 21.01 },
    });
    await expect(getCurrentPoint()).resolves.toEqual({ latitude: 52.23, longitude: 21.01 });
  });

  test('returns null when permission is denied', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await expect(getCurrentPoint()).resolves.toBeNull();
    expect(mockLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  test('returns null when the platform call fails', async () => {
    mockLocation.getCurrentPositionAsync.mockRejectedValue(new Error('unsupported'));
    await expect(getCurrentPoint()).resolves.toBeNull();
  });
});

describe('geocodeAddress', () => {
  test('maps the first geocoding result', async () => {
    mockLocation.geocodeAsync.mockResolvedValue([{ latitude: 10, longitude: 20 }]);
    await expect(geocodeAddress('  Baker Street London  ')).resolves.toEqual({
      latitude: 10,
      longitude: 20,
    });
    expect(mockLocation.geocodeAsync).toHaveBeenCalledWith('Baker Street London');
  });

  test('skips empty addresses and maps failures to null', async () => {
    await expect(geocodeAddress('   ')).resolves.toBeNull();
    expect(mockLocation.geocodeAsync).not.toHaveBeenCalled();

    mockLocation.geocodeAsync.mockRejectedValue(new Error('not supported on web'));
    await expect(geocodeAddress('somewhere')).resolves.toBeNull();
  });
});

describe('reverseGeocodeLabel', () => {
  test('joins the available address parts', async () => {
    mockLocation.reverseGeocodeAsync.mockResolvedValue([
      { street: 'Baker Street', streetNumber: '221b', city: 'London', region: null, country: 'UK' },
    ]);
    await expect(reverseGeocodeLabel({ latitude: 1, longitude: 2 })).resolves.toBe(
      'Baker Street 221b, London, UK',
    );
  });

  test('returns null when there is nothing to show or the call fails', async () => {
    mockLocation.reverseGeocodeAsync.mockResolvedValue([
      { street: null, streetNumber: null, city: null, region: null, country: null },
    ]);
    await expect(reverseGeocodeLabel({ latitude: 1, longitude: 2 })).resolves.toBeNull();

    mockLocation.reverseGeocodeAsync.mockRejectedValue(new Error('unsupported'));
    await expect(reverseGeocodeLabel({ latitude: 1, longitude: 2 })).resolves.toBeNull();
  });
});
