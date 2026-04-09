/**
 * Profile Screen — Real data from Firestore
 * Shows: Subscriptions, Posts, Streak
 * Badges from badge-service (no mock data)
 */

import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Badge, Video } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { checkAndAwardBadges, getAllBadgesForUser } from '@/services/badge-service';
import { db } from '@/services/firebase';
import * as UserService from '@/services/user-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, increment, orderBy, query, updateDoc, where } from 'firebase/firestore';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user, firebaseUser, signOut, refreshUser } = useAuth();

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rank, setRank] = useState(-1);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [myVideos, setMyVideos] = useState<Video[]>([]);

    const fetchProfileData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [userRank, allBadges, videosSnap] = await Promise.all([
                UserService.getUserRank(user.id),
                getAllBadgesForUser(user.id),
                getDocs(query(
                    collection(db, 'videos'),
                    where('submittedBy', '==', user.id),
                    orderBy('createdAt', 'desc'),
                )),
            ]);
            setRank(userRank);
            setBadges(allBadges);
            setMyVideos(videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[]);

            // Check & award badges silently
            await checkAndAwardBadges(user.id);
        } catch (error) {
            console.log('Profile data fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshUser();
        await fetchProfileData();
        setRefreshing(false);
    }, [fetchProfileData, refreshUser]);

    const handleDeleteVideo = (videoId: string) => {
        Alert.alert(
            'Delete Video',
            'Are you sure you want to remove this submission?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'videos', videoId));
                            if (user?.id) {
                                await updateDoc(doc(db, 'users', user.id), { posts: increment(-1) });
                            }
                            setMyVideos((prev) => prev.filter((v) => v.id !== videoId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete video');
                        }
                    },
                },
            ],
        );
    };

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (_) { }
    };

    const earnedBadges = badges.filter((b) => !b.isLocked);
    const lockedBadges = badges.filter((b) => b.isLocked);

    // ═══ NOT LOGGED IN ═══
    if (!firebaseUser || !user) {
        return (
            <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
                <View style={styles.loginPrompt}>
                    <View style={styles.loginIconWrap}>
                        <Ionicons name="person-circle-outline" size={80} color={Colors.primary} />
                    </View>
                    <Text style={[styles.loginTitle, { color: colors.text }]}>Sign in to GemSpots</Text>
                    <Text style={[styles.loginSubtitle, { color: colors.textMuted }]}>
                        Sign up or log in to discover hidden gems, track your streaks, and support small creators.
                    </Text>
                    <Pressable style={styles.loginBtn} onPress={() => router.push('/auth/login' as any)}>
                        <Ionicons name="log-in-outline" size={20} color={Colors.white} />
                        <Text style={styles.loginBtnText}>Sign In</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push('/auth/signup' as any)}>
                        <Text style={[styles.signupLink, { color: Colors.primary }]}>Don't have an account? Sign Up</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // ═══ LOGGED IN ═══
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
            >
                {/* ═══ HEADER ═══ */}
                <View style={[styles.profileHeader, { backgroundColor: isDark ? colors.card : Colors.white }]}>
                    <Pressable style={styles.settingsBtn} onPress={() => router.push('/settings' as any)}>
                        <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
                    </Pressable>
                    <Image
                        source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10B981&color=fff&size=128` }}
                        style={styles.avatar}
                    />
                    <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
                    <View style={styles.roleBadge}>
                        <Ionicons name={user.role === 'creator' ? 'videocam' : 'eye'} size={14} color={Colors.white} />
                        <Text style={styles.roleText}>{user.role === 'creator' ? 'Creator' : 'Viewer'}</Text>
                    </View>
                </View>

                {/* ═══ STATS ROW ═══ */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                        <Ionicons name="person-add" size={20} color={Colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{(user.subscribedTo ?? []).length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Subscriptions</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                        <Ionicons name="film" size={20} color={Colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{(user.posts ?? 0).toLocaleString()}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                        <Ionicons name="flame" size={20} color={Colors.accent} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{user.streak || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Streak</Text>
                    </View>
                </View>

                {/* ═══ QUICK LINKS ═══ */}
                <View style={styles.quickLinks}>
                </View>

                {/* ═══ BADGES ═══ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>🏅 Badges</Text>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 16 }} />
                    ) : (
                        <>
                            {earnedBadges.length > 0 && (
                                <View style={styles.badgeGrid}>
                                    {earnedBadges.map((b) => (
                                        <View key={b.id} style={[styles.badgeCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                                            <Text style={styles.badgeIcon}>{b.icon}</Text>
                                            <Text style={[styles.badgeName, { color: colors.text }]}>{b.name}</Text>
                                            <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>{b.description}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                            {lockedBadges.length > 0 && (
                                <>
                                    <Text style={[styles.lockedLabel, { color: colors.textMuted }]}>Locked</Text>
                                    <View style={styles.badgeGrid}>
                                        {lockedBadges.map((b) => (
                                            <View key={b.id} style={[styles.badgeCard, styles.lockedCard, { backgroundColor: isDark ? colors.card : '#f3f3f5' }]}>
                                                <Text style={[styles.badgeIcon, { opacity: 0.3 }]}>🔒</Text>
                                                <Text style={[styles.badgeName, { color: colors.textMuted }]}>{b.name}</Text>
                                                <Text style={[styles.badgeDesc, { color: colors.textMuted, opacity: 0.6 }]}>{b.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}
                        </>
                    )}
                </View>

                {/* ═══ MY SUBMISSIONS ═══ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📹 My Submissions</Text>
                    {myVideos.length === 0 ? (
                        <View style={styles.emptyVideos}>
                            <Ionicons name="videocam-off-outline" size={40} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                No submissions yet. Start discovering gems!
                            </Text>
                        </View>
                    ) : (
                        myVideos.map((v) => (
                            <Pressable
                                key={v.id}
                                style={[styles.videoRow, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}
                                onPress={() => router.push(`/video/${v.id}` as any)}
                            >
                                <Image source={{ uri: v.thumbnailUrl }} style={styles.videoThumb} />
                                <View style={styles.videoInfo}>
                                    <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>{v.title}</Text>
                                    <Text style={[styles.videoMeta, { color: colors.textMuted }]}>{v.creatorName} · {v.voteCount || 0} votes</Text>
                                </View>
                                <Pressable
                                    style={styles.deleteBtn}
                                    onPress={() => handleDeleteVideo(v.id)}
                                >
                                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                                </Pressable>
                            </Pressable>
                        ))
                    )}
                </View>

                {/* ═══ LOGOUT ═══ */}
                <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>

                <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    // Login prompt
    loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    loginIconWrap: { marginBottom: 16 },
    loginTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
    loginSubtitle: { fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    loginBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14,
        borderRadius: Radius.full,
    },
    loginBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
    signupLink: { marginTop: 16, fontSize: 14, fontWeight: '600' },

    // Profile header
    profileHeader: {
        alignItems: 'center', paddingTop: 20, paddingBottom: 24,
        marginHorizontal: Layout.screenPadding, marginTop: Spacing.sm,
        borderRadius: Radius.xl, position: 'relative',
        ...Shadows.sm,
    },
    settingsBtn: { position: 'absolute', top: 16, right: 16 },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.primary },
    userName: { fontSize: 22, fontWeight: '800', marginTop: 12 },
    userEmail: { fontSize: 14, marginTop: 4 },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: Radius.full, marginTop: 10,
    },
    roleText: { fontSize: 12, fontWeight: '700', color: Colors.white },

    // Stats
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-between', gap: 8,
        paddingHorizontal: Layout.screenPadding, marginTop: Spacing.md,
    },
    statBox: {
        flex: 1, alignItems: 'center', padding: 12, borderRadius: Radius.lg, gap: 4, ...Shadows.sm,
    },
    statValue: { fontSize: 18, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '500' },

    // Quick links
    quickLinks: { paddingHorizontal: Layout.screenPadding, marginTop: Spacing.md, gap: 8 },
    quickLink: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16, borderRadius: Radius.lg, ...Shadows.sm,
    },
    quickLinkText: { flex: 1, fontSize: 15, fontWeight: '600' },

    // Sections
    section: { paddingHorizontal: Layout.screenPadding, marginTop: Spacing.lg },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

    // Badges
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    badgeCard: {
        width: (SCREEN_WIDTH - Layout.screenPadding * 2 - 20) / 3,
        alignItems: 'center', padding: 12, borderRadius: Radius.lg, ...Shadows.sm,
    },
    lockedCard: { opacity: 0.7 },
    badgeIcon: { fontSize: 28, marginBottom: 6 },
    badgeName: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
    badgeDesc: { fontSize: 10, textAlign: 'center', marginTop: 4 },
    lockedLabel: { fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 8 },

    // Videos
    emptyVideos: { alignItems: 'center', paddingVertical: 32, gap: 8 },
    emptyText: { fontSize: 14, textAlign: 'center' },
    videoRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: 10, borderRadius: Radius.lg, marginBottom: 8, ...Shadows.sm,
    },
    videoThumb: { width: 80, height: 50, borderRadius: Radius.md },
    videoInfo: { flex: 1, paddingHorizontal: 12 },
    videoTitle: { fontSize: 14, fontWeight: '600' },
    videoMeta: { fontSize: 12, marginTop: 2 },
    deleteBtn: { padding: 8 },

    // Logout
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginHorizontal: Layout.screenPadding, marginTop: Spacing.xl,
        paddingVertical: 14, borderRadius: Radius.lg,
        borderWidth: 1, borderColor: Colors.error + '30',
    },
    logoutText: { fontSize: 15, fontWeight: '600', color: Colors.error },
});
