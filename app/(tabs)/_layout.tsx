/**
 * Tab Layout — 5 tabs with custom tab bar
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { CustomTabBar } from '@/components/custom-tab-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="upload" />
      <Tabs.Screen name="leaderboard" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
