import { MAX_SUGGESTIONS, MIN_QUERY_LENGTH, resolveAddress, suggestAddresses } from '../address-lookup';

const jsonResponse = (body: unknown, ok = true) => ({
  ok,
  json: async () => body,
});

describe('address lookup', () => {
  const fetchMock = jest.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const requestedUrl = () => String(fetchMock.mock.calls[0][0]);

  test('does not query for input shorter than the minimum', async () => {
    const short = ` ${'a'.repeat(MIN_QUERY_LENGTH - 1)} `;
    await expect(suggestAddresses(short)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('maps matching addresses to labels and coordinates', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        features: [
          {
            properties: {
              name: 'Empire State Building',
              street: '5th Avenue',
              housenumber: '350',
              city: 'New York',
              country: 'United States',
            },
            geometry: { coordinates: [-73.9857, 40.7484] },
          },
          {
            properties: { name: 'Krakowskie Przedmiescie', city: 'Warszawa', country: 'Polska' },
            geometry: { coordinates: [21.0136, 52.2465] },
          },
          { properties: { name: 'No coordinates' }, geometry: { coordinates: ['x', 'y'] } },
        ],
      }),
    );
    await expect(suggestAddresses('  Empire State Building  ')).resolves.toEqual([
      {
        label: 'Empire State Building, 5th Avenue 350, New York, United States',
        point: { latitude: 40.7484, longitude: -73.9857 },
      },
      {
        label: 'Krakowskie Przedmiescie, Warszawa, Polska',
        point: { latitude: 52.2465, longitude: 21.0136 },
      },
    ]);
    expect(requestedUrl()).toContain('q=Empire%20State%20Building');
    expect(requestedUrl()).toContain(`limit=${MAX_SUGGESTIONS}`);
    expect(requestedUrl()).not.toContain('lang=');
  });

  test('does not repeat the street when the name already contains it', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        features: [
          {
            properties: {
              name: '221B Baker Street',
              street: 'Baker Street',
              city: 'London',
              country: 'United Kingdom',
            },
            geometry: { coordinates: [-0.1582, 51.5234] },
          },
        ],
      }),
    );
    await expect(suggestAddresses('221b baker street')).resolves.toEqual([
      {
        label: '221B Baker Street, London, United Kingdom',
        point: { latitude: 51.5234, longitude: -0.1582 },
      },
    ]);
  });

  test('asks for English labels and ignores unsupported languages', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ features: [] }));

    await suggestAddresses('London', { lang: 'en' });
    expect(requestedUrl()).toContain('lang=en');

    fetchMock.mockClear();
    await suggestAddresses('Londyn', { lang: 'pl' });
    expect(requestedUrl()).not.toContain('lang=');
  });

  test('returns nothing when the service fails or responds unexpectedly', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, false));
    await expect(suggestAddresses('London')).resolves.toEqual([]);

    fetchMock.mockResolvedValue(jsonResponse({ features: 'nope' }));
    await expect(suggestAddresses('London')).resolves.toEqual([]);

    fetchMock.mockRejectedValue(new Error('offline'));
    await expect(suggestAddresses('London')).resolves.toEqual([]);
  });

  test('resolveAddress returns the coordinates of the best match', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        features: [{ properties: { name: 'London' }, geometry: { coordinates: [-0.12, 51.5] } }],
      }),
    );
    await expect(resolveAddress('London')).resolves.toEqual({ latitude: 51.5, longitude: -0.12 });
    expect(requestedUrl()).toContain('limit=1');
  });

  test('resolveAddress returns null for short or unmatched addresses', async () => {
    await expect(resolveAddress(' Lo')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValue(jsonResponse({ features: [] }));
    await expect(resolveAddress('Nowhere')).resolves.toBeNull();
  });
});
