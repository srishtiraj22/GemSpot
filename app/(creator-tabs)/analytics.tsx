/**
 * Creator Analytics Screen — Detailed performance analytics
 * Shows stats breakdown, per-video performance, and recent comments (engagement hub)
 */

import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Video, CreatorStats } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { db } from '@/services/firebase';
import { getCreatorStats, getRecentCommentsForCreator } from '@/services/creator-stats-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreatorAnalyticsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<CreatorStats | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [recentComments, setRecentComments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'comments'>('overview');

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [creatorStats, videosSnap, comments] = await Promise.all([
                getCreatorStats(user.id),
                getDocs(query(
                    collection(db, 'videos'),
                    where('submittedBy', '==', user.id),
                    orderBy('createdAt', 'desc'),
                )),
                getRecentCommentsForCreator(user.id, 15),
            ]);
            setStats(creatorStats);
            setVideos(videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[]);
            setRecentComments(comments);
        } catch (error) {
            console.log('Analytics fetch error:', error);
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

    // Sort videos by views for top performing list
    const topVideos = [...videos].sort((a, b) => (b.viewsFromPlatform || 0) - (a.viewsFromPlatform || 0));

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                    Track your channel performance
                </Text>
            </View>

            {/* Tab Switcher */}
            <View style={[styles.tabRow, { backgroundColor: isDark ? colors.cardElevated : '#f0f0f0' }]}>
                {(['overview', 'videos', 'comments'] as const).map((tab) => (
                    <Pressable
                        key={tab}
                        style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabBtnText, { color: activeTab === tab ? Colors.white : colors.text }]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </Pressable>
                ))}
            </View>

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
                {activeTab === 'overview' && (
                    <>
                        {/* Big Stats Cards */}
                        <View style={styles.bigStatsRow}>
                            <View style={[styles.bigStatCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                                <Ionicons name="eye" size={24} color={Colors.info} />
                                <Text style={[styles.bigStatValue, { color: colors.text }]}>
                                    {formatNumber(stats?.totalViews || 0)}
                                </Text>
                                <Text style={[styles.bigStatLabel, { color: colors.textMuted }]}>Total Views</Text>
                            </View>
                            <View style={[styles.bigStatCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                                <Ionicons name="heart" size={24} color={Colors.error} />
                                <Text style={[styles.bigStatValue, { color: colors.text }]}>
                                    {formatNumber(stats?.totalLikes || 0)}
                                </Text>
                                <Text style={[styles.bigStatLabel, { color: colors.textMuted }]}>Total Likes</Text>
                            </View>
                        </View>
                        <View style={styles.bigStatsRow}>
                            <View style={[styles.bigStatCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                                <Ionicons name="chatbubble" size={24} color={Colors.accent} />
                                <Text style={[styles.bigStatValue, { color: colors.text }]}>
                                    {formatNumber(stats?.totalComments || 0)}
                                </Text>
                                <Text style={[styles.bigStatLabel, { color: colors.textMuted }]}>Total Comments</Text>
                            </View>
                            <View style={[styles.bigStatCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                                <Ionicons name="people" size={24} color={Colors.primary} />
                                <Text style={[styles.bigStatValue, { color: colors.text }]}>
                                    {formatNumber(stats?.subscribers || 0)}
                                </Text>
                                <Text style={[styles.bigStatLabel, { color: colors.textMuted }]}>Subscribers</Text>
                            </View>
                        </View>

                        {/* Engagement Rate */}
                        {stats && stats.totalViews > 0 && (
                            <View style={[styles.engagementCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                                <Text style={[styles.engagementTitle, { color: colors.text }]}>📊 Engagement Rate</Text>
                                <Text style={[styles.engagementValue, { color: Colors.primary }]}>
                                    {(((stats.totalLikes + stats.totalComments) / stats.totalViews) * 100).toFixed(1)}%
                                </Text>
                                <Text style={[styles.engagementDesc, { color: colors.textMuted }]}>
                                    Based on likes + comments vs. total views
                                </Text>
                            </View>
                        )}

                        {/* Best Performing */}
                        {topVideos.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Best Performing</Text>
                                <Pressable
                                    style={[styles.bestCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                                    onPress={() => router.push(`/video/${topVideos[0].id}` as any)}
                                >
                                    <Image source={{ uri: topVideos[0].thumbnailUrl }} style={styles.bestThumb} />
                                    <View style={styles.bestInfo}>
                                        <Text style={[styles.bestTitle, { color: colors.text }]} numberOfLines={2}>
                                            {topVideos[0].title}
                                        </Text>
                                        <Text style={[styles.bestStat, { color: Colors.primary }]}>
                                            {formatNumber(topVideos[0].viewsFromPlatform || 0)} views · {formatNumber(topVideos[0].voteCount || 0)} likes
                                        </Text>
                                    </View>
                                </Pressable>
                            </>
                        )}
                    </>
                )}

                {activeTab === 'videos' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            📹 Video Performance ({videos.length})
                        </Text>
                        {topVideos.map((video, i) => (
                            <Pressable
                                key={video.id}
                                style={[styles.videoAnalyticsRow, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                                onPress={() => router.push(`/video/${video.id}` as any)}
                            >
                                <Text style={[styles.videoRank, { color: colors.textMuted }]}>#{i + 1}</Text>
                                <Image source={{ uri: video.thumbnailUrl }} style={styles.videoAnalyticsThumb} />
                                <View style={styles.videoAnalyticsInfo}>
                                    <Text style={[styles.videoAnalyticsTitle, { color: colors.text }]} numberOfLines={1}>
                                        {video.title}
                                    </Text>
                                    <View style={styles.videoAnalyticsStats}>
                                        <Text style={[styles.videoAnalyticsStat, { color: colors.textMuted }]}>
                                            👁 {formatNumber(video.viewsFromPlatform || 0)}
                                        </Text>
                                        <Text style={[styles.videoAnalyticsStat, { color: colors.textMuted }]}>
                                            ❤️ {formatNumber(video.voteCount || 0)}
                                        </Text>
                                        <Text style={[styles.videoAnalyticsStat, { color: colors.textMuted }]}>
                                            💬 {formatNumber(video.commentCount || 0)}
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                        {videos.length === 0 && (
                            <View style={styles.noData}>
                                <Ionicons name="bar-chart-outline" size={48} color={colors.textMuted} />
                                <Text style={[styles.noDataText, { color: colors.textMuted }]}>No videos to analyze yet</Text>
                            </View>
                        )}
                    </>
                )}

                {activeTab === 'comments' && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            💬 Recent Comments ({recentComments.length})
                        </Text>
                        {recentComments.map((comment) => (
                            <View
                                key={comment.id}
                                style={[styles.commentCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                            >
                                <View style={styles.commentHeader}>
                                    <Image
                                        source={{ uri: comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&size=64` }}
                                        style={styles.commentAvatar}
                                    />
                                    <View style={styles.commentMeta}>
                                        <Text style={[styles.commentUser, { color: colors.text }]}>{comment.userName}</Text>
                                        <Text style={[styles.commentVideo, { color: Colors.primary }]} numberOfLines={1}>
                                            on: {comment.videoTitle}
                                        </Text>
                                    </View>
                                    <Text style={[styles.commentDate, { color: colors.textMuted }]}>
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                                    </Text>
                                </View>
                                <Text style={[styles.commentText, { color: colors.textSecondary }]}>
                                    {comment.text}
                                </Text>
                                {comment.likes > 0 && (
                                    <Text style={[styles.commentLikes, { color: colors.textMuted }]}>
                                        ❤️ {comment.likes}
                                    </Text>
                                )}
                            </View>
                        ))}
                        {recentComments.length === 0 && (
                            <View style={styles.noData}>
                                <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
                                <Text style={[styles.noDataText, { color: colors.textMuted }]}>No comments yet</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: Spacing.md, paddingBottom: Spacing.xs,
    },
    headerTitle: { fontSize: 24, fontWeight: '800', fontFamily: 'Inter_700Bold' },
    headerSubtitle: { fontSize: 14, marginTop: 2, fontFamily: 'Inter_400Regular' },

    // Tab switcher
    tabRow: {
        flexDirection: 'row', marginHorizontal: Layout.screenPadding,
        borderRadius: Radius.full, padding: 4, marginVertical: Spacing.sm,
    },
    tabBtn: {
        flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.full,
    },
    tabBtnActive: { backgroundColor: Colors.primary },
    tabBtnText: { fontSize: 13, fontWeight: '600' },

    // Big stat cards
    bigStatsRow: {
        flexDirection: 'row', gap: Spacing.sm,
        paddingHorizontal: Layout.screenPadding, marginBottom: Spacing.sm,
    },
    bigStatCard: {
        flex: 1, alignItems: 'center', padding: Spacing.md,
        borderRadius: Radius.lg, gap: 6, ...Shadows.sm,
    },
    bigStatValue: { fontSize: 28, fontWeight: '800', fontFamily: 'Inter_700Bold' },
    bigStatLabel: { fontSize: 12, fontWeight: '500' },

    // Engagement
    engagementCard: {
        marginHorizontal: Layout.screenPadding, padding: Spacing.lg,
        borderRadius: Radius.lg, alignItems: 'center', gap: 6, ...Shadows.sm,
        marginBottom: Spacing.sm,
    },
    engagementTitle: { fontSize: 16, fontWeight: '700' },
    engagementValue: { fontSize: 36, fontWeight: '800', fontFamily: 'Inter_700Bold' },
    engagementDesc: { fontSize: 12, textAlign: 'center' },

    // Section
    sectionTitle: {
        fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold',
        paddingHorizontal: Layout.screenPadding, marginTop: Spacing.md, marginBottom: Spacing.sm,
    },

    // Best performing
    bestCard: {
        flexDirection: 'row', marginHorizontal: Layout.screenPadding,
        borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.sm,
    },
    bestThumb: { width: 120, height: 80 },
    bestInfo: { flex: 1, padding: Spacing.sm, justifyContent: 'center' },
    bestTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    bestStat: { fontSize: 13, fontWeight: '600' },

    // Video analytics
    videoAnalyticsRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: Layout.screenPadding, marginBottom: Spacing.sm,
        padding: Spacing.sm, borderRadius: Radius.lg, ...Shadows.sm,
    },
    videoRank: { fontSize: 14, fontWeight: '700', width: 28, textAlign: 'center' },
    videoAnalyticsThumb: { width: 72, height: 48, borderRadius: Radius.sm },
    videoAnalyticsInfo: { flex: 1, marginLeft: Spacing.sm },
    videoAnalyticsTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
    videoAnalyticsStats: { flexDirection: 'row', gap: 12 },
    videoAnalyticsStat: { fontSize: 12 },

    // Comments
    commentCard: {
        marginHorizontal: Layout.screenPadding, marginBottom: Spacing.sm,
        padding: Spacing.md, borderRadius: Radius.lg, ...Shadows.sm,
    },
    commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    commentAvatar: { width: 32, height: 32, borderRadius: 16 },
    commentMeta: { flex: 1, marginLeft: Spacing.sm },
    commentUser: { fontSize: 13, fontWeight: '700' },
    commentVideo: { fontSize: 11, marginTop: 1 },
    commentDate: { fontSize: 11 },
    commentText: { fontSize: 14, lineHeight: 20 },
    commentLikes: { fontSize: 12, marginTop: 6 },

    // No data
    noData: { alignItems: 'center', paddingVertical: Spacing.xl * 2, gap: Spacing.sm },
    noDataText: { fontSize: 14 },
});
