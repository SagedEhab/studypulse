import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/tabs';
import { Platform } from 'react-native';

import type { IconName } from '@/components/ui/icon';
import { colors } from '@/theme/tokens';

type TabIconProps = { focused: boolean; size: number; active: IconName; inactive: IconName };

/** A filled icon for the active tab, an outline for the others. */
function TabIcon({ focused, size, active, inactive }: TabIconProps) {
  return <Ionicons name={focused ? active : inactive} size={size} color={focused ? colors.primary : colors.textMuted} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
        // Phones size the bar around the home indicator; on web the default is too short for icon + label.
        tabBarStyle: Platform.select({ web: { height: 60 } }),
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          headerShown: false,
          tabBarIcon: ({ focused, size }) => <TabIcon focused={focused} size={size} active="today" inactive="today-outline" />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused, size }) => (
            <TabIcon focused={focused} size={size} active="checkbox" inactive="checkbox-outline" />
          ),
        }}
      />
    </Tabs>
  );
}
