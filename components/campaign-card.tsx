/**
 * CampaignCard — Brand deal card with title, budget, deadline, apply CTA
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation } from '@/constants/theme';
import { Campaign } from '@/constants/types';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CampaignCardProps {
    campaign: Campaign;
    onPress?: () => void;
    compact?: boolean;
}

export function CampaignCard({ campaign, onPress, compact }: CampaignCardProps) {
    const cardScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    return (
        <AnimatedPressable
            style={[compact ? styles.compactCard : styles.card, Shadows.md, animStyle]}
            onPress={onPress}
            onPressIn={() => { cardScale.value = withSpring(Animation.pressScale, Animation.spring); }}
            onPressOut={() => { cardScale.value = withSpring(1, Animation.spring); }}
        >
            <View style={styles.headerRow}>
                <Image source={{ uri: campaign.brandLogo }} style={styles.brandLogo} />
                <View style={styles.headerInfo}>
                    <Text style={styles.brandName}>{campaign.brandName}</Text>
                    <Text style={styles.title} numberOfLines={2}>{campaign.title}</Text>
                </View>
                <View style={[styles.statusChip, campaign.status === 'active' ? styles.statusActive : styles.statusClosed]}>
                    <Text style={styles.statusText}>{campaign.status === 'active' ? 'Active' : 'Closed'}</Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detail}>
                    <Ionicons name="cash-outline" size={14} color={Colors.accent} />
                    <Text style={styles.detailText}>{campaign.budget}</Text>
                </View>
                <View style={styles.detail}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textSecondaryDark} />
                    <Text style={styles.detailText}>{campaign.deadline}</Text>
                </View>
                <View style={styles.detail}>
                    <Ionicons name="people-outline" size={14} color={Colors.textSecondaryDark} />
                    <Text style={styles.detailText}>{campaign.applicantsCount}/{campaign.maxCreators}</Text>
                </View>
            </View>

            {!compact && (
                <View style={styles.categoryRow}>
                    <View style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{campaign.category}</Text>
                    </View>
                    <Pressable style={styles.applyBtn}>
                        <Text style={styles.applyText}>Apply Now</Text>
                        <Ionicons name="arrow-forward" size={14} color={Colors.white} />
                    </Pressable>
                </View>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    compactCard: {
        backgroundColor: Colors.white,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        width: 260,
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    headerRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    brandLogo: {
        width: 44,
        height: 44,
        borderRadius: Radius.sm,
        backgroundColor: Colors.cardLightElevated,
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    brandName: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.textSecondaryLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
        marginTop: 2,
    },
    statusChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.full,
        alignSelf: 'flex-start',
    },
    statusActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    statusClosed: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.primary,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textSecondaryLight,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    categoryChip: {
        backgroundColor: Colors.backgroundLight,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    categoryText: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textSecondaryLight,
    },
    applyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.full,
        ...Shadows.sm,
    },
    applyText: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.white,
    },
});
