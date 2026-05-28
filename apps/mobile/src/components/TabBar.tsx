import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Library, MessageCircle, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { palette } from '../theme/tokens';

/**
 * Custom tab bar — mirrors mockup-warm.html's nav pattern:
 * line-icon centered in a 56×32 pill that fills with coral-soft when
 * active. Labels are omitted (the mockup keeps the bar quiet); the
 * icons are tappable with full-cell hit targets.
 */
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  chat: MessageCircle,
  library: Library,
  me: User,
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      {state.routes.map((route, index) => {
        const Icon = ICONS[route.name];
        if (!Icon) return null;
        const isActive = state.index === index;
        const color = isActive ? palette.coral : palette.inkFaint;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isActive ? { selected: true } : {}}
            onPress={() => {
              if (!isActive) navigation.navigate(route.name as never);
            }}
            style={styles.cell}
            hitSlop={8}
          >
            <View style={[styles.pill, isActive && styles.pillActive]}>
              <Icon size={22} strokeWidth={1.8} color={color} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: palette.cream,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  pill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: palette.coralSoft,
  },
});
