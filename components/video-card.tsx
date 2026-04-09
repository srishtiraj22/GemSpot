/**
 * VideoCard — Thumbnail card with play overlay, Gem Score badge, and upvote button
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation } from '@/constants/theme';
import { Video } from '@/constants/types';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Gem Score formula */
function computeGemScore(v: Video): number {
    const nUp = Math.min(5, (v.voteCount || 0) / 100);
    const nComm = Math.min(5, (v.commentCount || 0) / 20);
    const nViews = Math.min(5, (v.viewsFromPlatform || 0) / 1000);
    const raw = (nUp * 0.4 + nComm * 0.3 + nViews * 0.3) * 2;
    return Math.min(10, parseFloat(Math.max(0.1, raw).toFixed(1)));
}

interface VideoCardProps {
    video: Video;
    onPress?: () => void;
    onVote?: () => void;
    isOwner?: boolean;
    compact?: boolean;
    horizontal?: boolean;
}

export function VideoCard({ video, onPress, onVote, isOwner, compact, horizontal }: VideoCardProps) {
    const [voted, setVoted] = useState(false);
    const [localVotes, setLocalVotes] = useState(video.voteCount);
    const cardScale = useSharedValue(1);
    const voteScale = useSharedValue(1);

    const cardAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    const voteAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: voteScale.value }],
    }));

    const handlePressIn = () => {
        cardScale.value = withSpring(Animation.pressScale, Animation.spring);
    };

    const handlePressOut = () => {
        cardScale.value = withSpring(1, Animation.spring);
    };

    const handleVote = () => {
        if (!voted) {
            setVoted(true);
            setLocalVotes((v) => v + 1);
            voteScale.value = withSequence(
                withSpring(Animation.bounceScale, { damping: 8, stiffness: 200 }),
                withSpring(1, Animation.spring)
            );
        }
        onVote?.();
    };

    const gemScore = computeGemScore(video);

    if (horizontal) {
        return (
            <AnimatedPressable
                style={[styles.horizontalCard, Shadows.md, cardAnimStyle]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View style={{ position: 'relative' }}>
                    <Image source={{ uri: video.thumbnailUrl }} style={styles.horizontalThumb} />
                    {/* Gem Score on horizontal */}
                    <View style={styles.gemBadgeSmall}>
                        <Ionicons name="diamond" size={9} color={Colors.white} />
                        <Text style={styles.gemBadgeSmallText}>{gemScore}</Text>
                    </View>
                </View>
                <View style={styles.horizontalInfo}>
                    <Text style={styles.horizontalTitle} numberOfLines={2}>{video.title}</Text>
                    <Text style={styles.channelName}>{video.creatorName}</Text>
                    <View style={styles.statsRow}>
                        <Text style={styles.statText}>{formatCount(video.subscriberCount)} subs</Text>
                        <View style={styles.dot} />
                        <Ionicons name="chevron-up" size={14} color={voted ? Colors.primary : Colors.textSecondaryDark} />
                        <Text style={[styles.statText, voted && styles.votedText]}>{formatCount(localVotes)}</Text>
                    </View>
                </View>
            </AnimatedPressable>
        );
    }

    return (
        <AnimatedPressable
            style={[compact ? styles.compactCard : styles.card, Shadows.md, cardAnimStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <View style={styles.thumbContainer}>
                <Image source={{ uri: video.thumbnailUrl }} style={compact ? styles.compactThumb : styles.thumbnail} />
                <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={compact ? 32 : 44} color="rgba(255,255,255,0.9)" />
                </View>

                {/* Gem Score Badge — top-right */}
                <View style={styles.gemBadge}>
                    <Ionicons name="diamond" size={10} color={Colors.white} />
                    <Text style={styles.gemBadgeText}>{gemScore}</Text>
                </View>

                {video.isTrending && (
                    <View style={styles.trendingBadge}>
                        <Text style={styles.badgeText}>🔥 Trending</Text>
                    </View>
                )}
                {video.isGemOfDay && (
                    <View style={[styles.trendingBadge, styles.gemOfDayBadge]}>
                        <Text style={styles.badgeText}>💎 Gem</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                    <Image source={{ uri: video.creatorAvatar }} style={styles.avatar} />
                    <View style={styles.titleCol}>
                        <Text style={compact ? styles.compactTitle : styles.title} numberOfLines={2}>{video.title}</Text>
                        <Text style={styles.channelName}>{video.creatorName} · {formatCount(video.subscriberCount)} subs</Text>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{video.category}</Text>
                    </View>
                    {isOwner ? (
                        /* Owner: show read-only vote count */
                        <View style={[styles.voteBtn, { opacity: 0.5 }]}>
                            <Ionicons name="chevron-up-outline" size={16} color={Colors.primary} />
                            <Text style={styles.voteCount}>{formatCount(localVotes)}</Text>
                        </View>
                    ) : (
                        <AnimatedPressable style={[styles.voteBtn, voted && styles.voteBtnActive, voteAnimStyle]} onPress={handleVote}>
                            <Ionicons name={voted ? 'chevron-up' : 'chevron-up-outline'} size={16} color={voted ? Colors.white : Colors.primary} />
                            <Text style={[styles.voteCount, voted && styles.voteCountActive]}>{formatCount(localVotes)}</Text>
                        </AnimatedPressable>
                    )}
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
    card: {
        backgroundColor: Colors.cardLight,
        borderRadius: Radius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.primary + '08',
        ...Shadows.apple,
    },
    compactCard: {
        backgroundColor: Colors.cardLight,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        width: 200,
        marginRight: Spacing.sm,
        ...Shadows.sm,
    },
    horizontalCard: {
        backgroundColor: Colors.cardLight,
        borderRadius: Radius.lg,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: Spacing.sm,
        ...Shadows.sm,
    },
    thumbContainer: { position: 'relative' },
    thumbnail: {
        width: '100%',
        height: 200,
        backgroundColor: Colors.cardLightElevated,
    },
    compactThumb: {
        width: 200,
        height: 112,
        backgroundColor: Colors.cardLightElevated,
    },
    horizontalThumb: {
        width: 120,
        height: 80,
        backgroundColor: Colors.cardLightElevated,
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.15)',
    },

    // Gem Score Badge — top-right
    gemBadge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.primary + 'E6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    gemBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.white,
    },
    gemBadgeSmall: {
        position: 'absolute',
        top: 4,
        right: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: Colors.primary + 'E6',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: Radius.full,
    },
    gemBadgeSmallText: {
        fontSize: 9,
        fontWeight: '800',
        color: Colors.white,
    },

    trendingBadge: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.full,
    },
    gemOfDayBadge: {
        backgroundColor: Colors.primary + 'E6',
        top: Spacing.sm + 26,
        left: Spacing.sm,
    },
    badgeText: {
        ...Typography.badge,
        color: Colors.white,
    },
    infoContainer: {
        padding: Spacing.md,
    },
    titleRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    titleCol: {
        flex: 1,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: Radius.full,
        backgroundColor: Colors.cardLightElevated,
    },
    title: {
        ...Typography.cardTitle,
        color: Colors.textPrimaryLight,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        fontSize: 16,
    },
    compactTitle: {
        ...Typography.body,
        color: Colors.textPrimaryLight,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
    },
    channelName: {
        ...Typography.caption,
        color: Colors.textMutedLight,
        marginTop: 4,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
    },
    horizontalInfo: {
        flex: 1,
        padding: Spacing.sm,
        justifyContent: 'center',
    },
    horizontalTitle: {
        ...Typography.body,
        color: Colors.textPrimaryLight,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    statText: {
        ...Typography.caption,
        color: Colors.textMutedLight,
    },
    votedText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: Colors.textMutedLight,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    categoryChip: {
        backgroundColor: Colors.cardLightElevated,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    categoryText: {
        ...Typography.caption,
        color: Colors.textSecondaryLight,
    },
    voteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        backgroundColor: Colors.primary + '15',
    },
    voteBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    voteCount: {
        ...Typography.badge,
        color: Colors.primary,
    },
    voteCountActive: {
        color: Colors.white,
    },
});
