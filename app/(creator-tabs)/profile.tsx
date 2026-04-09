/**
 * Creator Profile Screen — Editable profile with bio, category, avatar
 * Also shows public view: video grid and subscriber count
 */

import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Video, Category } from '@/constants/types';
import { CATEGORIES } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { db } from '@/services/firebase';
import { uploadImageAsync } from '@/services/storage-service';
import { getCreatorStats } from '@/services/creator-stats-service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_GRID_SIZE = (SCREEN_WIDTH - Layout.screenPadding * 2 - Spacing.sm * 2) / 3;

export default function CreatorProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user, signOut, refreshUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [subscriberCount, setSubscriberCount] = useState(0);

    // Editable fields
    const [editName, setEditName] = useState(user?.name || '');
    const [editBio, setEditBio] = useState('');
    const [editCategory, setEditCategory] = useState<Category>('Other');
    const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [stats, videosSnap] = await Promise.all([
                getCreatorStats(user.id),
                getDocs(query(
                    collection(db, 'videos'),
                    where('submittedBy', '==', user.id),
                    orderBy('createdAt', 'desc'),
                )),
            ]);
            setSubscriberCount(stats.subscribers || 0);
            setVideos(videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[]);

            // Load existing profile data
            setEditName(user.name || '');
            setEditBio((user as any).bio || '');
            setEditCategory((user as any).profileCategory || 'Other');
            setEditAvatar(user.avatar || '');
        } catch (error) {
            console.log('Profile fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshUser();
        await fetchData();
        setRefreshing(false);
    }, [fetchData, refreshUser]);

    const handlePickAvatar = async () => {
        const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permResult.granted) {
            Alert.alert('Permission Required', 'Please enable photo access in settings.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setEditAvatar(result.assets[0].uri);
        }
    };

    const handleSaveProfile = async () => {
        if (!user?.id) return;
        setSaving(true);

        try {
            let avatarUrl = editAvatar;

            // Upload new avatar if it's a local file
            if (editAvatar && !editAvatar.startsWith('http')) {
                avatarUrl = await uploadImageAsync(editAvatar, `avatars/${user.id}_${Date.now()}.jpg`);
            }

            await updateDoc(doc(db, 'users', user.id), {
                name: editName.trim(),
                bio: editBio.trim(),
                profileCategory: editCategory,
                avatar: avatarUrl,
            });

            await refreshUser();
            setEditing(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out', style: 'destructive',
                onPress: async () => { await signOut(); },
            },
        ]);
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

    const avatarUri = editAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'C')}&background=aca0bb&color=fff&size=128`;

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
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
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                        {/* Settings & Edit Buttons */}
                        <View style={styles.profileActions}>
                            <Pressable onPress={() => router.push('/settings' as any)}>
                                <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
                            </Pressable>
                            <Pressable onPress={() => editing ? handleSaveProfile() : setEditing(true)}>
                                {saving ? (
                                    <ActivityIndicator size="small" color={Colors.primary} />
                                ) : (
                                    <Text style={[styles.editBtn, { color: Colors.primary }]}>
                                        {editing ? 'Save' : 'Edit'}
                                    </Text>
                                )}
                            </Pressable>
                        </View>

                        {/* Avatar */}
                        <Pressable onPress={editing ? handlePickAvatar : undefined} disabled={!editing}>
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                            {editing && (
                                <View style={styles.avatarEditOverlay}>
                                    <Ionicons name="camera" size={18} color={Colors.white} />
                                </View>
                            )}
                        </Pressable>

                        {/* Name */}
                        {editing ? (
                            <TextInput
                                style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Your name"
                                placeholderTextColor={colors.textMuted}
                            />
                        ) : (
                            <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
                        )}

                        {/* Role Badge */}
                        <View style={styles.roleBadge}>
                            <Ionicons name="videocam" size={14} color={Colors.white} />
                            <Text style={styles.roleText}>Creator</Text>
                        </View>

                        {/* Bio */}
                        {editing ? (
                            <TextInput
                                style={[styles.bioInput, {
                                    color: colors.text, borderColor: colors.border,
                                    backgroundColor: isDark ? colors.card : '#f9f9f9',
                                }]}
                                value={editBio}
                                onChangeText={setEditBio}
                                placeholder="Write a bio..."
                                placeholderTextColor={colors.textMuted}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        ) : (
                            editBio ? (
                                <Text style={[styles.bioText, { color: colors.textSecondary }]}>{editBio}</Text>
                            ) : null
                        )}

                        {/* Category */}
                        {editing && (
                            <View style={styles.categorySection}>
                                <Text style={[styles.categoryLabel, { color: colors.textMuted }]}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.categoryRow}>
                                        {CATEGORIES.map((c) => {
                                            const isSelected = editCategory === c.name;
                                            return (
                                                <Pressable
                                                    key={c.name}
                                                    style={[
                                                        styles.categoryChip,
                                                        {
                                                            backgroundColor: isSelected ? Colors.primary : 'transparent',
                                                            borderColor: isSelected ? Colors.primary : colors.border,
                                                        },
                                                    ]}
                                                    onPress={() => setEditCategory(c.name)}
                                                >
                                                    <Text style={{ fontSize: 12 }}>{c.emoji}</Text>
                                                    <Text style={[styles.categoryChipText, { color: isSelected ? Colors.white : colors.text }]}>
                                                        {c.name}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{formatNumber(subscriberCount)}</Text>
                                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Subscribers</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{videos.length}</Text>
                                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Videos</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>🔥 {user?.streak || 0}</Text>
                                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Streak</Text>
                            </View>
                        </View>

                        {editing && (
                            <Pressable style={styles.cancelBtn} onPress={() => {
                                setEditing(false);
                                setEditName(user?.name || '');
                                setEditBio((user as any)?.bio || '');
                                setEditCategory((user as any)?.profileCategory || 'Other');
                                setEditAvatar(user?.avatar || '');
                            }}>
                                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel Editing</Text>
                            </Pressable>
                        )}
                    </View>

                    {/* Videos Grid */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>📹 My Videos</Text>
                    {videos.length === 0 ? (
                        <View style={[styles.emptyState, { backgroundColor: isDark ? colors.cardElevated : Colors.white }]}>
                            <Ionicons name="videocam-off-outline" size={40} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No videos uploaded yet</Text>
                        </View>
                    ) : (
                        <View style={styles.videoGrid}>
                            {videos.map((video) => (
                                <Pressable
                                    key={video.id}
                                    style={styles.videoGridItem}
                                    onPress={() => router.push(`/video/${video.id}` as any)}
                                >
                                    <Image source={{ uri: video.thumbnailUrl }} style={styles.videoGridThumb} />
                                    <View style={styles.videoGridOverlay}>
                                        <Text style={styles.videoGridViews}>
                                            {formatNumber(video.viewsFromPlatform || 0)} views
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Logout */}
                    <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // Profile Card
    profileCard: {
        marginHorizontal: Layout.screenPadding, marginTop: Spacing.md,
        borderRadius: Radius.xl, padding: Spacing.lg,
        alignItems: 'center', ...Shadows.md,
    },
    profileActions: {
        flexDirection: 'row', justifyContent: 'space-between',
        width: '100%', marginBottom: Spacing.sm,
    },
    editBtn: { fontSize: 15, fontWeight: '700' },
    avatar: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 3, borderColor: Colors.primary,
    },
    avatarEditOverlay: {
        position: 'absolute', bottom: 0, right: 0,
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    },
    userName: { fontSize: 22, fontWeight: '800', marginTop: Spacing.sm },
    nameInput: {
        fontSize: 22, fontWeight: '800', marginTop: Spacing.sm,
        borderBottomWidth: 2, paddingBottom: 4, textAlign: 'center',
        width: '80%',
    },
    roleBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: Radius.full, marginTop: Spacing.sm,
    },
    roleText: { fontSize: 12, fontWeight: '700', color: Colors.white },
    bioText: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
    bioInput: {
        width: '100%', marginTop: Spacing.sm,
        borderWidth: 1, borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md, paddingTop: Spacing.sm,
        fontSize: 14, minHeight: 70,
    },

    // Category
    categorySection: { width: '100%', marginTop: Spacing.md, gap: 8 },
    categoryLabel: { fontSize: 13, fontWeight: '600' },
    categoryRow: { flexDirection: 'row', gap: 6 },
    categoryChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: Radius.full, borderWidth: 1,
    },
    categoryChipText: { fontSize: 12, fontWeight: '600' },

    // Stats
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: Spacing.lg, width: '100%',
    },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '700' },
    statLabel: { fontSize: 12, marginTop: 2 },
    statDivider: { width: 1, height: 30 },

    cancelBtn: { marginTop: Spacing.md, padding: Spacing.sm },
    cancelBtnText: { fontSize: 14, fontWeight: '600' },

    // Section
    sectionTitle: {
        fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold',
        paddingHorizontal: Layout.screenPadding, marginTop: Spacing.lg, marginBottom: Spacing.sm,
    },

    // Video grid
    videoGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
        paddingHorizontal: Layout.screenPadding,
    },
    videoGridItem: {
        width: VIDEO_GRID_SIZE, height: VIDEO_GRID_SIZE * 0.7,
        borderRadius: Radius.md, overflow: 'hidden',
    },
    videoGridThumb: { width: '100%', height: '100%' },
    videoGridOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 3, paddingHorizontal: 6,
    },
    videoGridViews: { color: Colors.white, fontSize: 10, fontWeight: '600' },

    // Empty state
    emptyState: {
        marginHorizontal: Layout.screenPadding, borderRadius: Radius.lg,
        padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, ...Shadows.sm,
    },
    emptyText: { fontSize: 14 },

    // Logout
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginHorizontal: Layout.screenPadding, marginTop: Spacing.xl,
        paddingVertical: 14, borderRadius: Radius.lg,
        borderWidth: 1, borderColor: Colors.error + '30',
    },
    logoutText: { fontSize: 15, fontWeight: '600', color: Colors.error },
});
