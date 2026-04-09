/**
 * StatCard — Compact stat display (icon + number + label)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    value: string | number;
    label: string;
    color?: string;
    compact?: boolean;
}

export function StatCard({ icon, value, label, color = Colors.primary, compact }: StatCardProps) {
    return (
        <View style={[compact ? styles.compactCard : styles.card, Shadows.sm]}>
            <View style={[styles.iconBg, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={compact ? 18 : 22} color={color} />
            </View>
            <Text style={compact ? styles.compactValue : styles.value}>{typeof value === 'number' ? formatCount(value) : value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

function formatCount(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        padding: Spacing.md,
        alignItems: 'center',
        flex: 1,
        minWidth: 100,
    },
    compactCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
        alignItems: 'center',
        flex: 1,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    value: {
        ...Typography.sectionTitle,
        color: Colors.textPrimaryDark,
        fontSize: 20,
        marginBottom: 2,
    },
    compactValue: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
    },
    label: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
        textAlign: 'center',
    },
});
