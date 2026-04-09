/**
 * Leaderboard Screen — Top Creators & Top Videos from Firestore
 * No mock data — everything from ranking-service
 */

import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Video } from '@/constants/types';
import { useTheme } from '@/contexts/theme-context';
import { getTopCreators, getTopVideos, type RankingPeriod } from '@/services/ranking-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

type ContentTab = 'creators' | 'videos';

interface RankedCreator {
    id: string;
    name: string;
    channelId?: string;
    profilePicture?: string;
    totalVotes: number;
    videosCount: number;
    subscriberCount: number;
    rank: number;
}

export default function LeaderboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();

    const [period, setPeriod] = useState<RankingPeriod>('weekly');
    const [tab, setTab] = useState<ContentTab>('creators');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creators, setCreators] = useState<RankedCreator[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (tab === 'creators') {
                const data = await getTopCreators(period, 20);
                setCreators(data as any as RankedCreator[]);
            } else {
                const data = await getTopVideos(period, 20);
                setVideos(data);
            }
        } catch (error) {
            console.log('Leaderboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [tab, period]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [fetchData]);

    const topThree = creators.slice(0, 3);
    const rest = creators.slice(3);

    const podiumOrder = [topThree[1], topThree[0], topThree[2]];
    const podiumHeights = [90, 120, 75];
    const podiumIcons = ['🥈', '🥇', '🥉'];
    const podiumRanks = [2, 1, 3];

    const formatSubs = (c: number): string => {
        if (c >= 1000) return `${(c / 1000).toFixed(1)}k`;
        return String(c || 0);
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <Ionicons name="trophy" size={28} color={Colors.accent} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Rankings</Text>
                </View>
            </View>

            {/* Toggles */}
            <View style={styles.toggleRow}>
                {(['creators', 'videos'] as ContentTab[]).map((t) => (
                    <Pressable
                        key={t}
                        style={[styles.toggleBtn, tab === t && styles.toggleActive]}
                        onPress={() => setTab(t)}
                    >
                        <Text style={[
                            styles.toggleText, { color: colors.textMuted },
                            tab === t && styles.toggleTextActive,
                        ]}>
                            {t === 'creators' ? '👨‍🎤 Creators' : '🎬 Videos'}
                        </Text>
                    </Pressable>
                ))}

                <View style={styles.divider} />

                {(['weekly', 'monthly'] as RankingPeriod[]).map((p) => (
                    <Pressable
                        key={p}
                        style={[
                            styles.periodBtn,
                            { borderColor: isDark ? colors.border : 'rgba(0,0,0,0.08)' },
                            period === p && styles.periodActive,
                        ]}
                        onPress={() => setPeriod(p)}
                    >
                        <Text style={[
                            styles.periodText, { color: colors.textMuted },
                            period === p && styles.periodTextActive,
                        ]}>
                            {p === 'weekly' ? 'Week' : 'Month'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Loading rankings...</Text>
                    </View>
                ) : tab === 'creators' ? (
                    <>
                        {/* ═══ PODIUM ═══ */}
                        {topThree.length >= 1 && (
                            <View style={styles.podiumContainer}>
                                {podiumOrder.map((creator, i) => {
                                    if (!creator) return <View key={i} style={styles.podiumSlot} />;
                                    return (
                                        <Pressable
                                            key={creator.id}
                                            style={styles.podiumSlot}
                                            onPress={() => router.push(`/creator/${creator.id}` as any)}
                                        >
                                            <Text style={styles.podiumMedal}>{podiumIcons[i]}</Text>
                                            <Image
                                                source={{ uri: creator.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=10B981&color=fff` }}
                                                style={[
                                                    styles.podiumAvatar,
                                                    podiumRanks[i] === 1 && styles.podiumAvatarFirst,
                                                ]}
                                            />
                                            <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>{creator.name}</Text>
                                            <Text style={[styles.podiumStat, { color: colors.textMuted }]}>{creator.totalVotes || 0} votes</Text>
                                            <View style={[styles.podiumBar, {
                                                height: podiumHeights[i],
                                                backgroundColor: podiumRanks[i] === 1 ? Colors.accent : Colors.primary + '40',
                                            }]}>
                                                <Text style={styles.podiumRank}>#{podiumRanks[i]}</Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}

                        {/* ═══ REST ═══ */}
                        {rest.map((creator, i) => (
                            <Pressable
                                key={creator.id}
                                style={[styles.rankRow, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                                onPress={() => router.push(`/creator/${creator.id}` as any)}
                            >
                                <Text style={[styles.rankNum, { color: colors.textMuted }]}>{i + 4}</Text>
                                <Image
                                    source={{ uri: creator.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=10B981&color=fff` }}
                                    style={styles.rankAvatar}
                                />
                                <View style={styles.rankInfo}>
                                    <Text style={[styles.rankName, { color: colors.text }]}>{creator.name}</Text>
                                    <Text style={[styles.rankMeta, { color: colors.textMuted }]}>
                                        {formatSubs(creator.subscriberCount)} subs · {creator.videosCount || 0} videos
                                    </Text>
                                </View>
                                <View style={styles.voteBadge}>
                                    <Ionicons name="diamond" size={14} color={Colors.primary} />
                                    <Text style={styles.voteCount}>{creator.totalVotes || 0}</Text>
                                </View>
                            </Pressable>
                        ))}

                        {creators.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
                                <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No creators ranked yet</Text>
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Submit videos to see creators here</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        {/* ═══ TOP VIDEOS ═══ */}
                        {videos.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="videocam-off-outline" size={48} color={colors.textMuted} />
                                <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No videos ranked yet</Text>
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Submit videos to see them here</Text>
                            </View>
                        ) : (
                            videos.map((video, i) => (
                                <Pressable
                                    key={video.id}
                                    style={[styles.videoRow, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                                    onPress={() => router.push(`/video/${video.id}` as any)}
                                >
                                    <Text style={[styles.videoRank, {
                                        color: i < 3 ? Colors.accent : colors.textMuted,
                                    }]}>#{i + 1}</Text>
                                    <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumb} />
                                    <View style={styles.videoInfo}>
                                        <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>{video.title}</Text>
                                        <Text style={[styles.videoMeta, { color: colors.textMuted }]}>{video.creatorName}</Text>
                                    </View>
                                    <View style={styles.voteBadge}>
                                        <Ionicons name="diamond" size={14} color={Colors.primary} />
                                        <Text style={styles.voteCount}>{video.voteCount || 0}</Text>
                                    </View>
                                </Pressable>
                            ))
                        )}
                    </>
                )}

                <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    headerRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Layout.screenPadding, paddingVertical: Spacing.sm,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerTitle: { fontSize: 24, fontWeight: '800' },

    toggleRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Layout.screenPadding, paddingBottom: Spacing.sm, gap: 8,
    },
    toggleBtn: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: Radius.full,
    },
    toggleActive: { backgroundColor: Colors.primary },
    toggleText: { fontSize: 14, fontWeight: '600' },
    toggleTextActive: { color: Colors.white },
    divider: { width: 1, height: 20, backgroundColor: 'rgba(0,0,0,0.1)', marginHorizontal: 4 },
    periodBtn: {
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: Radius.full, borderWidth: 1,
    },
    periodActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
    periodText: { fontSize: 13, fontWeight: '500' },
    periodTextActive: { color: Colors.primary, fontWeight: '700' },

    content: { paddingBottom: Spacing.md },

    // Podium
    podiumContainer: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
        paddingHorizontal: Layout.screenPadding, paddingTop: 20, paddingBottom: 16,
    },
    podiumSlot: { flex: 1, alignItems: 'center', maxWidth: SCREEN_WIDTH / 3 - 16 },
    podiumMedal: { fontSize: 22, marginBottom: 4 },
    podiumAvatar: {
        width: 56, height: 56, borderRadius: 28,
        borderWidth: 2, borderColor: Colors.primary, marginBottom: 6,
    },
    podiumAvatarFirst: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: Colors.accent },
    podiumName: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
    podiumStat: { fontSize: 11, marginTop: 2 },
    podiumBar: {
        width: '80%', borderTopLeftRadius: 8, borderTopRightRadius: 8,
        justifyContent: 'center', alignItems: 'center', marginTop: 8,
    },
    podiumRank: { fontSize: 16, fontWeight: '800', color: Colors.white },

    // Rank rows
    rankRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: Layout.screenPadding, marginBottom: 8,
        padding: 12, borderRadius: Radius.lg, ...Shadows.sm,
    },
    rankNum: { fontSize: 16, fontWeight: '800', width: 32, textAlign: 'center' },
    rankAvatar: {
        width: 44, height: 44, borderRadius: 22,
        borderWidth: 1.5, borderColor: Colors.primary, marginRight: 12,
    },
    rankInfo: { flex: 1 },
    rankName: { fontSize: 15, fontWeight: '700' },
    rankMeta: { fontSize: 12, marginTop: 2 },
    voteBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: Radius.full, backgroundColor: Colors.primary + '15',
    },
    voteCount: { fontSize: 13, fontWeight: '700', color: Colors.primary },

    // Video rows
    videoRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: Layout.screenPadding, marginBottom: 8,
        padding: 10, borderRadius: Radius.lg, ...Shadows.sm,
    },
    videoRank: { fontSize: 16, fontWeight: '800', width: 36, textAlign: 'center' },
    videoThumb: { width: 80, height: 50, borderRadius: Radius.md, marginRight: 10 },
    videoInfo: { flex: 1 },
    videoTitle: { fontSize: 14, fontWeight: '600' },
    videoMeta: { fontSize: 12, marginTop: 2 },

    // Empty/Loading
    loadingContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '600' },
    emptyText: { fontSize: 13 },
});
