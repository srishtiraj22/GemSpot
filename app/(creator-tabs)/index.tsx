/**
 * Creator Dashboard — Main home screen for creators
 * Shows greeting, streak, aggregated stats, upload CTA, performance preview, and my videos
 */

import { Colors, Layout, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import type { Video, CreatorStats } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { db } from '@/services/firebase';
import { getCreatorStats } from '@/services/creator-stats-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteVideo } from '@/services/video-service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STAT_CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm * 2) / 3;

export default function CreatorDashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<CreatorStats | null>(null);
    const [myVideos, setMyVideos] = useState<Video[]>([]);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [creatorStats, videosSnap] = await Promise.all([
                getCreatorStats(user.id),
                getDocs(query(
                    collection(db, 'videos'),
                    where('submittedBy', '==', user.id),
                    orderBy('createdAt', 'desc'),
                )),
            ]);
            setStats(creatorStats);
            setMyVideos(videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[]);
        } catch (error) {
            console.log('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [fetchData]);

    const handleDeleteVideo = (videoId: string) => {
        Alert.alert(
            'Delete Video',
            'Are you sure you want to delete this video? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!user?.id) return;
                        const result = await deleteVideo(videoId, user.id);
                        if (result.success) {
                            setMyVideos((prev) => prev.filter((v) => v.id !== videoId));
                        } else {
                            Alert.alert('Error', result.error || 'Failed to delete video');
                        }
                    },
                },
            ],
        );
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    if (loading) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    // Find best performing video
    const bestVideo = myVideos.length > 0
        ? myVideos.reduce((best, v) => (v.viewsFromPlatform || 0) > (best.viewsFromPlatform || 0) ? v : best, myVideos[0])
        : null;

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
                contentContainerStyle={{ paddingBottom: Layout.tabBarHeight + Spacing.xl }}
            >
                {/* ═══ HEADER ═══ */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textMuted }]}>Welcome back,</Text>
                        <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Creator'}</Text>
                    </View>
                    <View style={[styles.streakBadge, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <Text style={[styles.streakText, { color: colors.text }]}>{user?.streak || 0} Day Streak</Text>
                    </View>
                </View>

                {/* ═══ UPLOAD CTA ═══ */}
                <Pressable
                    style={[styles.uploadCta, { backgroundColor: Colors.primary }]}
                    onPress={() => router.push('/(creator-tabs)/upload' as any)}
                >
                    <View style={styles.uploadCtaContent}>
                        <View style={styles.uploadCtaIcon}>
                            <Ionicons name="cloud-upload" size={28} color={Colors.white} />
                        </View>
                        <View style={styles.uploadCtaText}>
                            <Text style={styles.uploadCtaTitle}>Upload New Video</Text>
                            <Text style={styles.uploadCtaSubtitle}>Share your latest creation with the world</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                    </View>
                </Pressable>

                {/* ═══ STATS GRID ═══ */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="eye"
                        value={formatNumber(stats?.totalViews || 0)}
                        label="Views"
                        color={Colors.info}
                        isDark={isDark}
                        colors={colors}
                    />
                    <StatCard
                        icon="heart"
                        value={formatNumber(stats?.totalLikes || 0)}
                        label="Likes"
                        color={Colors.error}
                        isDark={isDark}
                        colors={colors}
                    />
                    <StatCard
                        icon="chatbubble"
                        value={formatNumber(stats?.totalComments || 0)}
                        label="Comments"
                        color={Colors.accent}
                        isDark={isDark}
                        colors={colors}
                    />
                    <StatCard
                        icon="people"
                        value={formatNumber(stats?.subscribers || 0)}
                        label="Subscribers"
                        color={Colors.primary}
                        isDark={isDark}
                        colors={colors}
                    />
                    <StatCard
                        icon="videocam"
                        value={formatNumber(stats?.totalVideos || 0)}
                        label="Videos"
                        color={Colors.primaryLight}
                        isDark={isDark}
                        colors={colors}
                    />
                </View>

                {/* ═══ PERFORMANCE PREVIEW ═══ */}
                {bestVideo && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>📈 Top Performing</Text>
                        <Pressable
                            style={[styles.bestVideoCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                            onPress={() => router.push(`/video/${bestVideo.id}` as any)}
                        >
                            <Image source={{ uri: bestVideo.thumbnailUrl }} style={styles.bestVideoThumb} />
                            <View style={styles.bestVideoInfo}>
                                <Text style={[styles.bestVideoTitle, { color: colors.text }]} numberOfLines={2}>
                                    {bestVideo.title}
                                </Text>
                                <View style={styles.bestVideoStats}>
                                    <View style={styles.miniStat}>
                                        <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
                                        <Text style={[styles.miniStatText, { color: colors.textMuted }]}>
                                            {formatNumber(bestVideo.viewsFromPlatform || 0)}
                                        </Text>
                                    </View>
                                    <View style={styles.miniStat}>
                                        <Ionicons name="heart-outline" size={14} color={colors.textMuted} />
                                        <Text style={[styles.miniStatText, { color: colors.textMuted }]}>
                                            {formatNumber(bestVideo.voteCount || 0)}
                                        </Text>
                                    </View>
                                    <View style={styles.miniStat}>
                                        <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
                                        <Text style={[styles.miniStatText, { color: colors.textMuted }]}>
                                            {formatNumber(bestVideo.commentCount || 0)}
                                        </Text>
                                    </View>
                                </View>
                                {bestVideo.isTrending && (
                                    <View style={styles.trendingBadge}>
                                        <Text style={styles.trendingText}>🚀 Trending</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    </>
                )}

                {/* ═══ MY VIDEOS ═══ */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📹 My Videos</Text>
                {myVideos.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                        <Ionicons name="videocam-off-outline" size={48} color={colors.textMuted} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No videos yet</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                            Upload your first video to start growing your channel
                        </Text>
                        <Pressable
                            style={styles.emptyUploadBtn}
                            onPress={() => router.push('/(creator-tabs)/upload' as any)}
                        >
                            <Ionicons name="add" size={18} color={Colors.white} />
                            <Text style={styles.emptyUploadBtnText}>Upload Video</Text>
                        </Pressable>
                    </View>
                ) : (
                    myVideos.map((video) => (
                        <View
                            key={video.id}
                            style={[styles.videoRow, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                        >
                            <Pressable
                                style={styles.videoRowContent}
                                onPress={() => router.push(`/video/${video.id}` as any)}
                            >
                                <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumb} />
                                <View style={styles.videoInfo}>
                                    <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                                        {video.title}
                                    </Text>
                                    <View style={styles.videoMeta}>
                                        <Text style={[styles.videoMetaText, { color: colors.textMuted }]}>
                                            {formatNumber(video.viewsFromPlatform || 0)} views
                                        </Text>
                                        <Text style={[styles.videoMetaDot, { color: colors.textMuted }]}>·</Text>
                                        <Text style={[styles.videoMetaText, { color: colors.textMuted }]}>
                                            {formatNumber(video.voteCount || 0)} likes
                                        </Text>
                                        <Text style={[styles.videoMetaDot, { color: colors.textMuted }]}>·</Text>
                                        <Text style={[styles.videoMetaText, { color: colors.textMuted }]}>
                                            {formatNumber(video.commentCount || 0)} comments
                                        </Text>
                                    </View>
                                    <Text style={[styles.videoDate, { color: colors.textMuted }]}>
                                        {video.submittedAt ? new Date(video.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                    </Text>
                                </View>
                            </Pressable>
                            <View style={styles.videoActions}>
                                <Pressable
                                    style={[styles.actionBtn, { backgroundColor: isDark ? colors.card : '#f5f5f5' }]}
                                    onPress={() => router.push(`/video/${video.id}` as any)}
                                >
                                    <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                                </Pressable>
                                <Pressable
                                    style={[styles.actionBtn, { backgroundColor: Colors.error + '15' }]}
                                    onPress={() => handleDeleteVideo(video.id)}
                                >
                                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                                </Pressable>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

function StatCard({ icon, value, label, color, isDark, colors }: {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    label: string;
    color: string;
    isDark: boolean;
    colors: any;
}) {
    return (
        <View style={[styles.statCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
            <View style={[styles.statIconWrap, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    },
    greeting: { fontSize: 14, fontFamily: 'Inter_400Regular' },
    userName: { fontSize: 24, fontWeight: '800', fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
    streakBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: Radius.full, ...Shadows.sm,
    },
    streakEmoji: { fontSize: 16 },
    streakText: { fontSize: 13, fontWeight: '700' },

    // Upload CTA
    uploadCta: {
        marginHorizontal: Layout.screenPadding, borderRadius: Radius.xl,
        padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.lg,
    },
    uploadCtaContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    uploadCtaIcon: {
        width: 48, height: 48, borderRadius: Radius.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    uploadCtaText: { flex: 1 },
    uploadCtaTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, fontFamily: 'Inter_700Bold' },
    uploadCtaSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontFamily: 'Inter_400Regular' },

    // Section
    sectionTitle: {
        fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold',
        paddingHorizontal: Layout.screenPadding, marginTop: Spacing.md, marginBottom: Spacing.sm,
    },

    // Stats grid
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
        paddingHorizontal: Layout.screenPadding,
    },
    statCard: {
        width: STAT_CARD_WIDTH, alignItems: 'center',
        padding: Spacing.md, borderRadius: Radius.lg, gap: 6, ...Shadows.sm,
    },
    statIconWrap: {
        width: 36, height: 36, borderRadius: Radius.full,
        justifyContent: 'center', alignItems: 'center',
    },
    statValue: { fontSize: 20, fontWeight: '800', fontFamily: 'Inter_700Bold' },
    statLabel: { fontSize: 11, fontWeight: '500', fontFamily: 'Inter_500Medium' },

    // Best video
    bestVideoCard: {
        flexDirection: 'row', marginHorizontal: Layout.screenPadding,
        borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.sm,
    },
    bestVideoThumb: { width: 110, height: 80 },
    bestVideoInfo: { flex: 1, padding: Spacing.sm, justifyContent: 'center' },
    bestVideoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    bestVideoStats: { flexDirection: 'row', gap: 12 },
    miniStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    miniStatText: { fontSize: 12 },
    trendingBadge: {
        backgroundColor: Colors.accent + '20', alignSelf: 'flex-start',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, marginTop: 6,
    },
    trendingText: { fontSize: 11, fontWeight: '700', color: Colors.accent },

    // My Videos
    videoRow: {
        marginHorizontal: Layout.screenPadding, marginBottom: Spacing.sm,
        borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.sm,
    },
    videoRowContent: { flexDirection: 'row', padding: Spacing.sm },
    videoThumb: { width: 100, height: 64, borderRadius: Radius.md },
    videoInfo: { flex: 1, marginLeft: Spacing.sm, justifyContent: 'center' },
    videoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    videoMeta: { flexDirection: 'row', alignItems: 'center' },
    videoMetaText: { fontSize: 11 },
    videoMetaDot: { fontSize: 11, marginHorizontal: 4 },
    videoDate: { fontSize: 11, marginTop: 2 },
    videoActions: {
        flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.sm,
        paddingBottom: Spacing.sm, justifyContent: 'flex-end',
    },
    actionBtn: {
        width: 34, height: 34, borderRadius: Radius.full,
        justifyContent: 'center', alignItems: 'center',
    },

    // Empty state
    emptyState: {
        marginHorizontal: Layout.screenPadding, borderRadius: Radius.xl,
        padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, ...Shadows.sm,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    emptyUploadBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.primary, paddingHorizontal: 20,
        paddingVertical: 10, borderRadius: Radius.full, marginTop: Spacing.sm,
    },
    emptyUploadBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
