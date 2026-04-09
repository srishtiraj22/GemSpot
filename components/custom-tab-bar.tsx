/**
 * CustomTabBar — Apple-style tab bar with dark mode support
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation, Layout } from '@/constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/theme-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
    index: { active: 'home', inactive: 'home-outline' },
    explore: { active: 'compass', inactive: 'compass-outline' },
    upload: { active: 'add-circle', inactive: 'add-circle-outline' },
    leaderboard: { active: 'trophy', inactive: 'trophy-outline' },
    profile: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
    index: 'Home',
    explore: 'Discover',
    upload: 'Upload',
    leaderboard: 'Ranks',
    profile: 'Profile',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();

    return (
        <View style={[
            styles.wrapper,
            {
                paddingBottom: Math.max(insets.bottom, Spacing.sm),
                backgroundColor: isDark ? Colors.tabBarDark : Colors.tabBarLight,
                borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0, 0, 0, 0.06)',
            }
        ]}>
            <View style={styles.container}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const icons = TAB_ICONS[route.name] || { active: 'help-circle', inactive: 'help-circle-outline' };
                    const label = TAB_LABELS[route.name] || route.name;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TabItem
                            key={route.key}
                            label={label}
                            iconName={isFocused ? icons.active : icons.inactive}
                            isFocused={isFocused}
                            onPress={onPress}
                            isDark={isDark}
                        />
                    );
                })}
            </View>
        </View>
    );
}

function TabItem({ label, iconName, isFocused, onPress, isDark }: {
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    isFocused: boolean;
    onPress: () => void;
    isDark: boolean;
}) {
    const tabScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: tabScale.value }],
    }));

    const inactiveColor = isDark ? Colors.textMutedDark : Colors.textMutedLight;

    return (
        <AnimatedPressable
            style={[styles.tab, animStyle]}
            onPress={onPress}
            onPressIn={() => { tabScale.value = withSpring(0.9, Animation.spring); }}
            onPressOut={() => { tabScale.value = withSpring(1, Animation.spring); }}
        >
            <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? Colors.primary : inactiveColor}
            />
            <Text style={[styles.label, { color: isFocused ? Colors.primary : inactiveColor }]}>
                {label}
            </Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Spacing.sm,
        paddingHorizontal: Spacing.sm,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 2,
    },
    label: {
        fontSize: 10,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});
