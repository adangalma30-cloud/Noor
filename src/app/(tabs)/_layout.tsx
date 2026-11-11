import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { Icon } from '../../components/ui';
import { useTheme } from '../../theme';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.bg },
        headerTitleStyle: { fontWeight: '800', color: t.text, fontSize: 20 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: t.card,
          borderTopColor: t.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.sub,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => <Icon name="home" color={color} filled={focused} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ color, focused }) => <Icon name="book" color={color} filled={focused} />,
        }}
      />
      <Tabs.Screen
        name="adhan"
        options={{
          title: 'Adhan',
          tabBarIcon: ({ color, focused }) => <Icon name="megaphone" color={color} filled={focused} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, focused }) => <Icon name="grid" color={color} filled={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <Icon name="gear" color={color} filled={focused} />,
        }}
      />
    </Tabs>
  );
}
