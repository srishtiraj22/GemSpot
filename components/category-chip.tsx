/**
 * CategoryChip — Pill-shaped filter chip with no clipping
 */

import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

interface CategoryChipProps {
    label?: string;
    name?: string;
    emoji?: string;
    isActive?: boolean;
    isSelected?: boolean;
    onPress?: () => void;
}

export function CategoryChip({ label, name, emoji, isActive, isSelected, onPress }: CategoryChipProps) {
    const active = isActive || isSelected || false;
    const displayLabel = label || name || '';

    return (
        <Pressable
            style={[styles.chip, active && styles.chipActive]}
            onPress={onPress}
        >
            {emoji ? (
                <Text style={styles.emoji}>{emoji}</Text>
            ) : null}
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {displayLabel}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        height: 36,
        paddingHorizontal: 14,
        borderRadius: Radius.full,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 5,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
        ...Shadows.sm,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    emoji: {
        fontSize: 13,
    },
    label: {
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textSecondaryLight,
    },
    labelActive: {
        color: Colors.white,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
    },
});
