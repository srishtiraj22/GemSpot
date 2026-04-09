/**
 * SkeletonLoader — Shimmer placeholder for loading states
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: Colors.cardDarkElevated,
                },
                animStyle,
                style,
            ]}
        />
    );
}

/** Pre-built skeleton for a video card */
export function VideoCardSkeleton() {
    return (
        <View style={styles.videoSkeleton}>
            <Skeleton height={200} borderRadius={Radius.lg} />
            <View style={styles.videoInfo}>
                <View style={styles.videoInfoRow}>
                    <Skeleton width={32} height={32} borderRadius={Radius.full} />
                    <View style={{ flex: 1, gap: 6 }}>
                        <Skeleton height={14} width="80%" />
                        <Skeleton height={10} width="50%" />
                    </View>
                </View>
            </View>
        </View>
    );
}

/** Pre-built skeleton for a creator card */
export function CreatorCardSkeleton() {
    return (
        <View style={styles.creatorSkeleton}>
            <Skeleton width={56} height={56} borderRadius={Radius.full} />
            <Skeleton height={10} width={60} style={{ marginTop: 6 }} />
            <Skeleton height={8} width={40} style={{ marginTop: 4 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    videoSkeleton: {
        backgroundColor: Colors.cardDark,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    videoInfo: {
        padding: Spacing.sm,
    },
    videoInfoRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        alignItems: 'center',
    },
    creatorSkeleton: {
        alignItems: 'center',
        marginRight: Spacing.md,
        width: 76,
    },
});
