/**
 * SearchBar — White rounded input with search icon
 * Matches Stitch search bar design
 */

import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onSubmit?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search videos, creators, or topics', onSubmit }: SearchBarProps) {
    const { isDark, colors } = useTheme();
    const cardBg = isDark ? colors.cardElevated : Colors.white;

    return (
        <View style={[styles.container, { backgroundColor: cardBg }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.icon} />
            <TextInput
                style={[styles.input, { color: colors.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                onSubmitEditing={onSubmit}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: Radius.xl,
        height: 52,
        paddingHorizontal: Spacing.lg,
        ...Shadows.sm,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
    },
});
