/**
 * Creator Profile Screen — Fetches real data from Firestore
 */

import { UnclaimedBadge } from '@/components/unclaimed-badge';
import { VideoCard } from '@/components/video-card';
import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Video } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { db } from '@/services/firebase';
import { isSubscribed as checkIsSubscribed, subscribeToCreator, unsubscribeFromCreator } from '@/services/subscribe-service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CreatorData {
    id: string;
    name: string;
    profilePicture?: string;
    channelId?: string;
    subscriberCount: number;
    claimed: boolean;
    userId?: string | null;
    totalVotes: number;
    videosCount: number;
    rank?: number;
}

export default function CreatorProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user, refreshUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [creator, setCreator] = useState<CreatorData | null>(null);
    const [creatorVideos, setCreatorVideos] = useState<Video[]>([]);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        fetchCreator();
    }, [id]);

    const fetchCreator = async () => {
        setLoading(true);
        try {
            // Fetch creator doc
            const creatorSnap = await getDoc(doc(db, 'creators', id!));
            if (creatorSnap.exists()) {
                const data = { ...creatorSnap.data(), id: creatorSnap.id } as CreatorData;
                setCreator(data);

                // Fetch creator's videos
                const videosQ = query(
                    collection(db, 'videos'),
                    where('creatorId', '==', id),
                    orderBy('createdAt', 'desc'),
                );
                const videosSnap = await getDocs(videosQ);
                setCreatorVideos(videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[]);

                // Check subscribe status
                if (user?.id) {
                    const isSub = await checkIsSubscribed(user.id, id!);
                    setSubscribed(isSub);
                }
            } else {
                setCreator(null);
            }
        } catch (error) {
            console.log('Failed to load creator:', error);
            setCreator(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!user?.id || !id) return;
        const wasSubscribed = subscribed;
        // Optimistic UI update
        setSubscribed(!wasSubscribed);
        try {
            if (wasSubscribed) {
                const result = await unsubscribeFromCreator(user.id, id);
                if (!result.success) throw new Error(result.error);
            } else {
                const result = await subscribeToCreator(user.id, id);
                if (!result.success) throw new Error(result.error);
            }
            // Refresh auth context so subscribedTo stays in sync
            await refreshUser();
        } catch (error) {
            // Rollback on failure
            setSubscribed(wasSubscribed);
            console.log('Subscribe action failed:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!creator) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <Ionicons name="person-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Creator not found</Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={[styles.goBackText, { color: Colors.primary }]}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const isClaimed = creator.claimed;
    const avatar = creator.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=10B981&color=fff&size=128`;

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={[styles.backBtn, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Creator Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Avatar + Name + Stats */}
                <View style={[styles.profileCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <Text style={[styles.creatorName, { color: colors.text }]}>{creator.name}</Text>
                    <View style={styles.subsRow}>
                        <Ionicons name="people" size={14} color={colors.textMuted} />
                        <Text style={[styles.subsText, { color: colors.textMuted }]}>{(creator.subscriberCount || 0).toLocaleString()} subscribers</Text>
                    </View>

                    {/* Follow Button */}
                    {user?.id && user.id !== creator.userId && (
                        <Pressable
                            style={[styles.followBtn, subscribed && styles.followBtnActive]}
                            onPress={handleSubscribe}
                        >
                            <Ionicons
                                name={subscribed ? 'checkmark' : 'person-add'}
                                size={16}
                                color={subscribed ? Colors.white : Colors.primary}
                            />
                            <Text style={[styles.followBtnText, subscribed && styles.followBtnTextActive]}>
                                {subscribed ? 'Subscribed' : 'Subscribe'}
                            </Text>
                        </Pressable>
                    )}

                    {/* Claimed / Unclaimed */}
                    {isClaimed ? (
                        <View style={styles.claimedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                            <Text style={styles.claimedText}>Verified Creator</Text>
                        </View>
                    ) : (
                        <UnclaimedBadge creatorName={creator.name} variant="chip" />
                    )}

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{creator.totalVotes || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Votes</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{creator.videosCount || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Videos</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>#{creator.rank || '-'}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rank</Text>
                        </View>
                    </View>
                </View>

                {/* Unclaimed Banner */}
                {!isClaimed && (
                    <View style={styles.bannerContainer}>
                        <UnclaimedBadge creatorName={creator.name} variant="banner" />
                    </View>
                )}

                {/* Videos */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Videos</Text>
                {creatorVideos.length > 0 ? (
                    <View style={styles.videoList}>
                        {creatorVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                compact
                                isOwner={!!(user?.id && video.submittedBy === user.id)}
                                onPress={() => router.push(`/video/${video.id}` as any)}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyVideos}>
                        <Ionicons name="videocam-off-outline" size={40} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No videos submitted yet</Text>
                    </View>
                )}

                <View style={{ height: Spacing.xl * 2 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Layout.screenPadding, paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: Radius.full,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { paddingHorizontal: Layout.screenPadding },
    profileCard: {
        alignItems: 'center', borderRadius: Radius.xl,
        padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.md,
    },
    avatar: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 3, borderColor: Colors.primary, marginBottom: Spacing.sm,
    },
    creatorName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    subsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
    subsText: { fontSize: 14 },
    followBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 20, paddingVertical: 10,
        borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.primary,
        marginBottom: Spacing.sm,
    },
    followBtnActive: { backgroundColor: Colors.primary },
    followBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
    followBtnTextActive: { color: Colors.white },
    claimedBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: 16, paddingVertical: 4,
        borderRadius: Radius.full, marginBottom: Spacing.md,
    },
    claimedText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '700' },
    statLabel: { fontSize: 12, marginTop: 2 },
    statDivider: { width: 1, height: 30 },
    bannerContainer: { marginBottom: Spacing.md },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
    videoList: { gap: Spacing.sm },
    emptyVideos: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
    emptyText: { fontSize: 14 },
    notFoundText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
    goBackText: { fontSize: 14, fontWeight: '600', marginTop: 8 },
});
