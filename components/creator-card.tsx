/**
 * CreatorCard — Avatar card with name, subs, votes, rank badge
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation } from '@/constants/theme';
import { Creator } from '@/constants/types';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CreatorCardProps {
    creator: Creator;
    onPress?: () => void;
    variant?: 'compact' | 'full';
}

export function CreatorCard({ creator, onPress, variant = 'compact' }: CreatorCardProps) {
    const cardScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    const handlePressIn = () => {
        cardScale.value = withSpring(Animation.pressScale, Animation.spring);
    };

    const handlePressOut = () => {
        cardScale.value = withSpring(1, Animation.spring);
    };

    if (variant === 'compact') {
        return (
            <AnimatedPressable
                style={[styles.compactCard, animStyle]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: creator.avatar }} style={styles.compactAvatar} />
                    {creator.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                        </View>
                    )}
                </View>
                <Text style={styles.compactName} numberOfLines={1}>{creator.name}</Text>
                <Text style={styles.compactSubs}>{formatCount(creator.subscriberCount)} subs</Text>
            </AnimatedPressable>
        );
    }

    return (
        <AnimatedPressable
            style={[styles.fullCard, Shadows.md, animStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <View style={styles.fullRow}>
                <View style={styles.rankContainer}>
                    <Text style={styles.rankText}>#{creator.rank}</Text>
                </View>
                <Image source={{ uri: creator.avatar }} style={styles.fullAvatar} />
                <View style={styles.fullInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.fullName}>{creator.name}</Text>
                        {creator.isVerified && (
                            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                        )}
                    </View>
                    <Text style={styles.fullSubs}>{formatCount(creator.subscriberCount)} subs</Text>
                </View>
                <View style={styles.fullStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="chevron-up" size={14} color={Colors.primary} />
                        <Text style={styles.statValue}>{formatCount(creator.totalVotes)}</Text>
                    </View>
                    <View style={[styles.growthBadge, creator.growthPercent > 20 ? styles.growthHigh : styles.growthNormal]}>
                        <Ionicons name="trending-up" size={12} color={Colors.white} />
                        <Text style={styles.growthText}>+{creator.growthPercent}%</Text>
                    </View>
                </View>
            </View>
        </AnimatedPressable>
    );
}

function formatCount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
}

const styles = StyleSheet.create({
    compactCard: {
        alignItems: 'center',
        marginRight: Spacing.md,
        width: 76,
    },
    avatarContainer: {
        position: 'relative',
    },
    compactAvatar: {
        width: 56,
        height: 56,
        borderRadius: Radius.full,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: Colors.surfaceDark,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: Colors.backgroundDark,
        borderRadius: Radius.full,
    },
    compactName: {
        ...Typography.caption,
        color: Colors.textPrimaryDark,
        marginTop: Spacing.xs,
        fontWeight: '500',
        textAlign: 'center',
    },
    compactSubs: {
        ...Typography.caption,
        color: Colors.textMutedDark,
        fontSize: 10,
        textAlign: 'center',
    },
    fullCard: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    fullRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    rankContainer: {
        width: 28,
        alignItems: 'center',
    },
    rankText: {
        ...Typography.badge,
        color: Colors.textSecondaryDark,
        fontSize: 13,
    },
    fullAvatar: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceDark,
    },
    fullInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    fullName: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryDark,
    },
    fullSubs: {
        ...Typography.caption,
        color: Colors.textSecondaryDark,
        marginTop: 2,
    },
    fullStats: {
        alignItems: 'flex-end',
        gap: 4,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    statValue: {
        ...Typography.caption,
        color: Colors.textPrimaryDark,
        fontWeight: '600',
    },
    growthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: Radius.full,
    },
    growthNormal: {
        backgroundColor: Colors.primaryDark,
    },
    growthHigh: {
        backgroundColor: Colors.accent,
    },
    growthText: {
        ...Typography.badge,
        color: Colors.white,
        fontSize: 10,
    },
});
