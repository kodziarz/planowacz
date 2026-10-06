import { act, fireEvent, render } from '@testing-library/react-native';

import { AddressSuggestions } from '../address-suggestions';

import { suggestAddresses } from '@/utils/address-lookup';

jest.mock('@/utils/address-lookup', () => ({
  MIN_QUERY_LENGTH: 3,
  suggestAddresses: jest.fn(),
}));

const london = { label: 'London, United Kingdom', point: { latitude: 51.5, longitude: -0.12 } };
const bridge = {
  label: 'London Bridge, London, United Kingdom',
  point: { latitude: 51.507, longitude: -0.08 },
};

const flushDebounce = async () => {
  await act(async () => {
    jest.advanceTimersByTime(350);
  });
};

describe('AddressSuggestions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(suggestAddresses).mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('does not look up queries shorter than the minimum', async () => {
    const { queryByText } = render(<AddressSuggestions query=" Lo " onSelect={jest.fn()} />);
    await flushDebounce();
    expect(suggestAddresses).not.toHaveBeenCalled();
    expect(queryByText(london.label)).toBeNull();
  });

  test('shows the matching prompts after the debounce delay and reports the pick', async () => {
    jest.mocked(suggestAddresses).mockResolvedValue([london, bridge]);
    const onSelect = jest.fn();
    const { getByText, queryByText } = render(
      <AddressSuggestions query="  Lond " lang="en" onSelect={onSelect} />,
    );
    expect(queryByText(london.label)).toBeNull();

    await flushDebounce();

    expect(suggestAddresses).toHaveBeenCalledWith('Lond', { lang: 'en' });
    expect(getByText(london.label)).toBeTruthy();
    fireEvent.press(getByText(bridge.label));
    expect(onSelect).toHaveBeenCalledWith(bridge);
  });

  test('hides the previous prompts once the query changes', async () => {
    jest.mocked(suggestAddresses).mockResolvedValue([london]);
    const { rerender, queryByText } = render(
      <AddressSuggestions query="Lond" lang="en" onSelect={jest.fn()} />,
    );
    await flushDebounce();
    expect(queryByText(london.label)).toBeTruthy();

    rerender(<AddressSuggestions query="Paris" lang="en" onSelect={jest.fn()} />);
    expect(queryByText(london.label)).toBeNull();

    await flushDebounce();
    expect(suggestAddresses).toHaveBeenLastCalledWith('Paris', { lang: 'en' });
  });

  test('stays hidden when nothing matches', async () => {
    jest.mocked(suggestAddresses).mockResolvedValue([]);
    const { toJSON } = render(<AddressSuggestions query="Nowhere" onSelect={jest.fn()} />);
    await flushDebounce();
    expect(toJSON()).toBeNull();
  });
});
