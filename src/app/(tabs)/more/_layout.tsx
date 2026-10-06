import { Stack } from 'expo-router';

/**
 * A stack nested inside the “More” tab, so opening Queues, Categories,
 * Statistics, Settings or Import keeps the bottom menu bar visible.
 */
export default function MoreLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
