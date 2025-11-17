/**
 * Tab navigation layout
 */

import { Tabs } from 'expo-router';
import { COLORS, FONT_SIZES } from '../../theme';
import { MicrophoneIcon, MusicNoteIcon, SettingsIcon } from '../../components/Icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="editor"
        options={{
          title: 'Editor',
          tabBarIcon: ({ color, size }) => (
            <MicrophoneIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="takes"
        options={{
          title: 'Takes',
          tabBarIcon: ({ color, size }) => (
            <MusicNoteIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
