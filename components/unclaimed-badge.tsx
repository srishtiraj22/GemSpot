/**
 * Unclaimed Badge — Visual indicator + Invite button for unclaimed creators
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { inviteCreator } from '@/services/creator-service';

interface UnclaimedBadgeProps {
    creatorName: string;
    /** 'chip' = small inline badge, 'banner' = full-width banner with invite button */
    variant?: 'chip' | 'banner';
}

export function UnclaimedBadge({ creatorName, variant = 'chip' }: UnclaimedBadgeProps) {
    if (variant === 'banner') {
        return (
            <View style={styles.banner}>
                <View style={styles.bannerTop}>
                    <Ionicons name="alert-circle" size={20} color={Colors.accent} />
                    <View style={styles.bannerText}>
                        <Text style={styles.bannerTitle}>Unclaimed Creator</Text>
                        <Text style={styles.bannerSubtitle}>
                            {creatorName} has not joined GemSpots yet. Invite them to claim their profile!
                        </Text>
                    </View>
                </View>
                <Pressable
                    style={styles.inviteBtn}
                    onPress={() => inviteCreator(creatorName)}
                >
                    <Ionicons name="paper-plane" size={16} color={Colors.white} />
                    <Text style={styles.inviteBtnText}>Invite Creator</Text>
                </Pressable>
            </View>
        );
    }

    // Chip variant — small inline badge
    return (
        <View style={styles.chip}>
            <View style={styles.chipDot} />
            <Text style={styles.chipText}>Unclaimed</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    // ── Chip variant ──
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.accent + '20',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    chipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.accent,
    },
    chipText: {
        ...Typography.badge,
        color: Colors.accent,
        fontSize: 10,
    },

    // ── Banner variant ──
    banner: {
        backgroundColor: Colors.accent + '12',
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.accent + '30',
        gap: Spacing.sm,
    },
    bannerTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    bannerText: {
        flex: 1,
    },
    bannerTitle: {
        ...Typography.cardTitle,
        color: Colors.accent,
    },
    bannerSubtitle: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
        marginTop: 2,
        lineHeight: 18,
    },
    inviteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.accent,
        paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.md,
    },
    inviteBtnText: {
        ...Typography.button,
        color: Colors.white,
    },
});
