/**
 * EmptyState — Thoughtful empty states with illustrations
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}>
                <Ionicons name={icon} size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {actionLabel && onAction && (
                <Pressable style={styles.actionBtn} onPress={onAction}>
                    <Text style={styles.actionText}>{actionLabel}</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing['3xl'],
        paddingHorizontal: Spacing.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: Radius.full,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondaryDark,
        textAlign: 'center',
        lineHeight: 20,
    },
    actionBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.full,
        marginTop: Spacing.lg,
    },
    actionText: {
        ...Typography.button,
        color: Colors.white,
    },
});
