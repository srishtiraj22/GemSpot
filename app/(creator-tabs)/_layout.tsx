/**
 * Creator Tab Layout — 5 tabs with creator-specific tab bar
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { CreatorTabBar } from '@/components/creator-tab-bar';

export default function CreatorTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CreatorTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="upload" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="subscribers" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
