import { Tabs } from 'expo-router';

import { TabBar } from '../../src/components/TabBar';

/**
 * Tabs layout for the four main destinations. Routes inside the
 * `(tabs)` group are URL-flat (e.g. `/home`, `/chat`) — the
 * parenthesized segment is invisible. Splash and onboarding live
 * outside this group so they render full-screen without the bar.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
