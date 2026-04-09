/**
 * Creator Subscribers Screen — View and manage subscribers
 * Shows total subscriber count and list of subscribers with clickable profiles
 */

import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { getCreatorStats, getSubscribersList } from '@/services/creator-stats-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Subscriber {
    id: string;
    name: string;
    avatar: string;
    joinedAt: string;
    followedAt: any;
}

export default function CreatorSubscribersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalSubs, setTotalSubs] = useState(0);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [stats, subs] = await Promise.all([
                getCreatorStats(user.id),
                getSubscribersList(user.id, 100),
            ]);
            setTotalSubs(stats.subscribers || 0);
            setSubscribers(subs);
        } catch (error) {
            console.log('Subscribers fetch error:', error);
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

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Subscribers</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                    People who follow your channel
                </Text>
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
                {/* Total Subscribers Card */}
                <View style={[styles.totalCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                    <View style={[styles.totalIconWrap, { backgroundColor: Colors.primary + '15' }]}>
                        <Ionicons name="people" size={32} color={Colors.primary} />
                    </View>
                    <Text style={[styles.totalValue, { color: colors.text }]}>
                        {formatNumber(totalSubs)}
                    </Text>
                    <Text style={[styles.totalLabel, { color: colors.textMuted }]}>
                        Total Subscribers
                    </Text>
                </View>

                {/* Subscriber List */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    👥 All Subscribers ({subscribers.length})
                </Text>

                {subscribers.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                        <Ionicons name="people-outline" size={48} color={colors.textMuted} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No subscribers yet</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                            Keep uploading great content to grow your subscriber base!
                        </Text>
                    </View>
                ) : (
                    subscribers.map((sub) => (
                        <Pressable
                            key={sub.id}
                            style={[styles.subscriberRow, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                            onPress={() => router.push(`/creator/${sub.id}` as any)}
                        >
                            <Image
                                source={{ uri: sub.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.name)}&background=aca0bb&color=fff&size=64` }}
                                style={styles.subscriberAvatar}
                            />
                            <View style={styles.subscriberInfo}>
                                <Text style={[styles.subscriberName, { color: colors.text }]}>{sub.name}</Text>
                                <Text style={[styles.subscriberSince, { color: colors.textMuted }]}>
                                    Joined {sub.joinedAt ? new Date(sub.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'recently'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                        </Pressable>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    },
    headerTitle: { fontSize: 24, fontWeight: '800', fontFamily: 'Inter_700Bold' },
    headerSubtitle: { fontSize: 14, marginTop: 2, fontFamily: 'Inter_400Regular' },

    // Total card
    totalCard: {
        marginHorizontal: Layout.screenPadding, padding: Spacing.xl,
        borderRadius: Radius.xl, alignItems: 'center', gap: Spacing.sm, ...Shadows.md,
        marginBottom: Spacing.md,
    },
    totalIconWrap: {
        width: 64, height: 64, borderRadius: 32,
        justifyContent: 'center', alignItems: 'center',
    },
    totalValue: { fontSize: 40, fontWeight: '800', fontFamily: 'Inter_700Bold' },
    totalLabel: { fontSize: 14, fontWeight: '500' },

    // Section
    sectionTitle: {
        fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold',
        paddingHorizontal: Layout.screenPadding, marginTop: Spacing.sm, marginBottom: Spacing.sm,
    },

    // Subscriber row
    subscriberRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: Layout.screenPadding, marginBottom: Spacing.sm,
        padding: Spacing.md, borderRadius: Radius.lg, ...Shadows.sm,
    },
    subscriberAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: Colors.primary + '30' },
    subscriberInfo: { flex: 1, marginLeft: Spacing.md },
    subscriberName: { fontSize: 15, fontWeight: '600' },
    subscriberSince: { fontSize: 12, marginTop: 2 },

    // Empty state
    emptyState: {
        marginHorizontal: Layout.screenPadding, borderRadius: Radius.xl,
        padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, ...Shadows.sm,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
