/**
 * Settings Screen — Functional app preferences, account management, help & about
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Switch,
    TextInput,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { db } from '@/services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '@/services/storage-service';
import { Image } from 'react-native';

const PREFS_KEY = '@gemspots_prefs';

const FAQ_ITEMS = [
    { q: 'What is GemSpots?', a: 'GemSpots is a platform to discover, upvote, and support hidden YouTube creators with under 50K subscribers.' },
    { q: 'How does Gem Score work?', a: 'Gem Score (0–10) is calculated from upvotes (40%), comments (30%), and YouTube views (30%). Higher engagement = higher score.' },
    { q: 'How do I earn points?', a: 'You earn points by watching videos, voting daily, maintaining streaks, and participating in the community.' },
    { q: 'Can I submit my own channel?', a: 'Yes! If you have under 50K subscribers, you can submit your videos via the Upload tab.' },
    { q: 'How do brand deals work?', a: 'Brands post campaigns for small creators. You can apply through the Brand Deals section in your profile.' },
    { q: 'How do I delete my account?', a: 'Contact support@gemspots.app and we will process your request within 48 hours.' },
];

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut, refreshUser } = useAuth();
    const { isDark, toggleTheme, colors } = useTheme();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [showPublicProfile, setShowPublicProfile] = useState(true);
    const [allowComments, setAllowComments] = useState(true);

    // Edit Profile Modal
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // Help Center
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    useEffect(() => {
        loadPrefs();
    }, []);

    const loadPrefs = async () => {
        try {
            const raw = await AsyncStorage.getItem(PREFS_KEY);
            if (raw) {
                const prefs = JSON.parse(raw);
                if (prefs.notifications !== undefined) setNotificationsEnabled(prefs.notifications);
                if (prefs.emailNotifications !== undefined) setEmailNotifications(prefs.emailNotifications);
                if (prefs.showPublicProfile !== undefined) setShowPublicProfile(prefs.showPublicProfile);
                if (prefs.allowComments !== undefined) setAllowComments(prefs.allowComments);
            }
        } catch { }
    };

    const savePrefs = async (updates: Record<string, any>) => {
        try {
            const raw = await AsyncStorage.getItem(PREFS_KEY);
            const prefs = raw ? JSON.parse(raw) : {};
            const merged = { ...prefs, ...updates };
            await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(merged));
        } catch { }
    };

    const handleNotificationsToggle = (val: boolean) => {
        setNotificationsEnabled(val);
        savePrefs({ notifications: val });
    };

    const handleEmailToggle = (val: boolean) => {
        setEmailNotifications(val);
        savePrefs({ emailNotifications: val });
    };

    const handlePublicProfile = (val: boolean) => {
        setShowPublicProfile(val);
        savePrefs({ showPublicProfile: val });
    };

    const handleAllowComments = (val: boolean) => {
        setAllowComments(val);
        savePrefs({ allowComments: val });
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setSaving(true);
        setUploadProgress('');

        try {
            if (user?.id) {
                let finalAvatarUrl = user.avatar;

                // Did the user pick a new local file? (Not an http URL)
                if (editAvatar && editAvatar !== user.avatar && !editAvatar.startsWith('http')) {
                    setUploadProgress('Uploading image...');
                    const ext = editAvatar.split('.').pop() || 'jpg';
                    const path = `avatars/${user.id}_${Date.now()}.${ext}`;
                    finalAvatarUrl = await uploadImageAsync(editAvatar, path);
                } else if (editAvatar.startsWith('http')) {
                    // They manually pasted a URL or kept the old one
                    finalAvatarUrl = editAvatar;
                }

                setUploadProgress('Updating profile...');
                await updateDoc(doc(db, 'users', user.id), {
                    name: editName.trim(),
                    avatar: finalAvatarUrl,
                });
                await refreshUser();
            }
            setShowEditProfile(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (e: any) {
            console.log('Profile update failed:', e);
            Alert.alert('Error', e.message || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
            setUploadProgress('');
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setEditAvatar(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setEditAvatar(result.assets[0].uri);
        }
    };

    const bgColor = colors.background;
    const cardBg = isDark ? colors.cardElevated : Colors.white;
    const borderColor = isDark ? colors.border : 'rgba(0,0,0,0.04)';
    const textColor = colors.text;
    const mutedColor = colors.textMuted;

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: bgColor }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* ═══ Account Section ═══ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
                    <View style={[styles.cardGroup, { backgroundColor: cardBg, borderColor }]}>
                        <Pressable
                            style={[styles.cardRow, styles.borderBottom, { borderBottomColor: borderColor }]}
                            onPress={() => {
                                setEditName(user?.name || '');
                                setEditAvatar(user?.avatar || '');
                                setShowEditProfile(true);
                            }}
                        >
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.primary + '15' }]}>
                                    <Ionicons name="person-outline" size={20} color={Colors.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.rowText, { color: textColor }]}>Edit Profile</Text>
                                    <Text style={[styles.rowHint, { color: mutedColor }]}>Name, avatar</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={mutedColor} />
                        </Pressable>
                    </View>
                </View>

                {/* ═══ Privacy & Security Section ═══ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Privacy & Security</Text>
                    <View style={[styles.cardGroup, { backgroundColor: cardBg, borderColor }]}>
                        <View style={[styles.cardRow, styles.borderBottom, { borderBottomColor: borderColor }]}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.info + '15' }]}>
                                    <Ionicons name="eye-outline" size={20} color={Colors.info} />
                                </View>
                                <Text style={[styles.rowText, { color: textColor }]}>Public Profile</Text>
                            </View>
                            <Switch
                                value={showPublicProfile}
                                onValueChange={handlePublicProfile}
                                trackColor={{ false: isDark ? '#555' : '#ddd', true: Colors.primary }}
                                thumbColor={Colors.white}
                            />
                        </View>
                        <View style={[styles.cardRow, styles.borderBottom, { borderBottomColor: borderColor }]}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.success + '15' }]}>
                                    <Ionicons name="chatbubbles-outline" size={20} color={Colors.success} />
                                </View>
                                <Text style={[styles.rowText, { color: textColor }]}>Allow Comments</Text>
                            </View>
                            <Switch
                                value={allowComments}
                                onValueChange={handleAllowComments}
                                trackColor={{ false: isDark ? '#555' : '#ddd', true: Colors.primary }}
                                thumbColor={Colors.white}
                            />
                        </View>
                        <View style={styles.cardRow}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.warning + '15' }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={Colors.warning} />
                                </View>
                                <View>
                                    <Text style={[styles.rowText, { color: textColor }]}>Two-Factor Auth</Text>
                                    <Text style={[styles.rowHint, { color: mutedColor }]}>Coming soon</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={mutedColor} />
                        </View>
                    </View>
                </View>

                {/* ═══ Preferences Section ═══ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
                    <View style={[styles.cardGroup, { backgroundColor: cardBg, borderColor }]}>
                        <View style={[styles.cardRow, styles.borderBottom, { borderBottomColor: borderColor }]}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.textSecondaryDark + '15' }]}>
                                    <Ionicons name="moon-outline" size={20} color={isDark ? Colors.accent : textColor} />
                                </View>
                                <Text style={[styles.rowText, { color: textColor }]}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: isDark ? '#555' : '#ddd', true: Colors.primary }}
                                thumbColor={Colors.white}
                            />
                        </View>
                        <View style={[styles.cardRow, styles.borderBottom, { borderBottomColor: borderColor }]}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.accent + '15' }]}>
                                    <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
                                </View>
                                <Text style={[styles.rowText, { color: textColor }]}>Push Notifications</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleNotificationsToggle}
                                trackColor={{ false: isDark ? '#555' : '#ddd', true: Colors.primary }}
                                thumbColor={Colors.white}
                            />
                        </View>
                        <View style={styles.cardRow}>
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.info + '15' }]}>
                                    <Ionicons name="mail-outline" size={20} color={Colors.info} />
                                </View>
                                <Text style={[styles.rowText, { color: textColor }]}>Email Notifications</Text>
                            </View>
                            <Switch
                                value={emailNotifications}
                                onValueChange={handleEmailToggle}
                                trackColor={{ false: isDark ? '#555' : '#ddd', true: Colors.primary }}
                                thumbColor={Colors.white}
                            />
                        </View>
                    </View>
                </View>

                {/* ═══ Support Section ═══ */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>
                    <View style={[styles.cardGroup, { backgroundColor: cardBg, borderColor }]}>
                        <Pressable
                            style={[styles.cardRow, styles.borderBottom, { borderBottomColor: borderColor }]}
                            onPress={() => setShowHelp(!showHelp)}
                        >
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.success + '15' }]}>
                                    <Ionicons name="help-buoy-outline" size={20} color={Colors.success} />
                                </View>
                                <Text style={[styles.rowText, { color: textColor }]}>Help Center</Text>
                            </View>
                            <Ionicons name={showHelp ? 'chevron-down' : 'chevron-forward'} size={20} color={mutedColor} />
                        </Pressable>

                        {showHelp && (
                            <View style={[styles.faqContainer, { borderTopColor: borderColor }]}>
                                {FAQ_ITEMS.map((item, i) => (
                                    <Pressable
                                        key={i}
                                        style={[styles.faqItem, i < FAQ_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }]}
                                        onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                    >
                                        <View style={styles.faqHeader}>
                                            <Text style={[styles.faqQuestion, { color: textColor }]}>{item.q}</Text>
                                            <Ionicons
                                                name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                                                size={16}
                                                color={mutedColor}
                                            />
                                        </View>
                                        {expandedFaq === i && (
                                            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.a}</Text>
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        <Pressable
                            style={styles.cardRow}
                            onPress={() => setShowAbout(!showAbout)}
                        >
                            <View style={styles.rowLeft}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.primary + '15' }]}>
                                    <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                                </View>
                                <Text style={[styles.rowText, { color: textColor }]}>About GemSpots</Text>
                            </View>
                            <Ionicons name={showAbout ? 'chevron-down' : 'chevron-forward'} size={20} color={mutedColor} />
                        </Pressable>

                        {showAbout && (
                            <View style={[styles.aboutContainer, { borderTopColor: borderColor }]}>
                                <Text style={[styles.aboutTitle, { color: textColor }]}>💎 GemSpots v1.0.0</Text>
                                <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                                    GemSpots is a community-driven platform that helps you discover and support
                                    hidden YouTube creators with under 50,000 subscribers. We believe great content
                                    deserves to be seen, regardless of subscriber count.
                                </Text>
                                <View style={styles.aboutStats}>
                                    <View style={styles.aboutStat}>
                                        <Text style={[styles.aboutStatValue, { color: Colors.primary }]}>10K+</Text>
                                        <Text style={[styles.aboutStatLabel, { color: mutedColor }]}>Users</Text>
                                    </View>
                                    <View style={styles.aboutStat}>
                                        <Text style={[styles.aboutStatValue, { color: Colors.accent }]}>2K+</Text>
                                        <Text style={[styles.aboutStatLabel, { color: mutedColor }]}>Creators</Text>
                                    </View>
                                    <View style={styles.aboutStat}>
                                        <Text style={[styles.aboutStatValue, { color: Colors.success }]}>50K+</Text>
                                        <Text style={[styles.aboutStatLabel, { color: mutedColor }]}>Upvotes</Text>
                                    </View>
                                </View>
                                <Text style={[styles.aboutFooter, { color: mutedColor }]}>
                                    Made with ❤️ by the GemSpots Team{'\n'}
                                    Contact: support@gemspots.app
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Logout Button */}
                <Pressable style={[styles.logoutBtn, { backgroundColor: cardBg, borderColor }]} onPress={() => signOut()}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>

                <View style={{ height: Spacing.xl + Layout.tabBarHeight }} />
            </ScrollView>

            {/* ═══ Edit Profile Modal ═══ */}
            <Modal
                visible={showEditProfile}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowEditProfile(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={[styles.modalContainer, { backgroundColor: bgColor }]}
                >
                    <View style={styles.modalHeader}>
                        <Pressable onPress={() => setShowEditProfile(false)}>
                            <Text style={[styles.modalCancel, { color: Colors.primary }]}>Cancel</Text>
                        </Pressable>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Edit Profile</Text>
                        <Pressable onPress={handleSaveProfile} disabled={saving}>
                            <Text style={[styles.modalSave, { color: Colors.primary, opacity: saving ? 0.5 : 1 }]}>
                                {saving ? 'Saving...' : 'Save'}
                            </Text>
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                        {saving && uploadProgress ? (
                            <View style={styles.progressContainer}>
                                <ActivityIndicator size="small" color={Colors.primary} />
                                <Text style={[styles.progressText, { color: colors.textSecondary }]}>{uploadProgress}</Text>
                            </View>
                        ) : null}

                        <View style={styles.avatarSection}>
                            <Image source={{ uri: editAvatar || 'https://ui-avatars.com/api/?name=User&background=random' }} style={[styles.editAvatarImage, { borderColor }]} />
                            <View style={styles.avatarActionRow}>
                                <Pressable style={[styles.avatarActionBtn, { backgroundColor: Colors.primary + '15' }]} onPress={pickImage}>
                                    <Ionicons name="images" size={16} color={Colors.primary} />
                                    <Text style={[styles.avatarActionText, { color: Colors.primary }]}>Gallery</Text>
                                </Pressable>
                                <Pressable style={[styles.avatarActionBtn, { backgroundColor: Colors.accent + '15' }]} onPress={takePhoto}>
                                    <Ionicons name="camera" size={16} color={Colors.accent} />
                                    <Text style={[styles.avatarActionText, { color: Colors.accent }]}>Camera</Text>
                                </Pressable>
                            </View>
                        </View>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Display Name</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: cardBg, borderColor, color: textColor }]}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Your name"
                            placeholderTextColor={mutedColor}
                        />

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                        <View style={[styles.modalInput, styles.disabledInput, { backgroundColor: isDark ? '#222' : '#f0f0f0', borderColor }]}>
                            <Text style={[styles.disabledText, { color: mutedColor }]}>{user?.email || 'Not available'}</Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.md,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
    },
    scrollContent: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: Spacing.md,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.textSecondaryLight,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    cardGroup: {
        backgroundColor: Colors.white,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        overflow: 'hidden',
        ...Shadows.sm,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.04)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        flex: 1,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowText: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textPrimaryLight,
    },
    rowHint: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: Colors.textMutedLight,
        marginTop: 1,
    },
    logoutBtn: {
        backgroundColor: Colors.white,
        borderRadius: Radius.xl,
        paddingVertical: Spacing.md + 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        ...Shadows.sm,
        marginTop: Spacing.md,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.error,
    },

    // FAQ
    faqContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
    },
    faqItem: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        paddingRight: Spacing.sm,
    },
    faqAnswer: {
        fontSize: 13,
        lineHeight: 19,
        marginTop: Spacing.sm,
        paddingRight: Spacing.md,
    },

    // About
    aboutContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
        padding: Spacing.md,
    },
    aboutTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 21,
        marginBottom: Spacing.md,
    },
    aboutStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: Spacing.md,
    },
    aboutStat: {
        alignItems: 'center',
        gap: 2,
    },
    aboutStatValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    aboutStatLabel: {
        fontSize: 12,
    },
    aboutFooter: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },

    // Modal
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Layout.screenPadding,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    modalCancel: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    modalSave: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalContent: {
        padding: Layout.screenPadding,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        marginTop: Spacing.md,
    },
    modalInput: {
        height: Layout.inputHeight,
        borderRadius: Radius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: 16,
        justifyContent: 'center',
    },
    disabledInput: {
        opacity: 0.6,
    },
    disabledText: {
        fontSize: 16,
    },
    inputHint: {
        fontSize: 12,
        marginTop: Spacing.xs,
        lineHeight: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        backgroundColor: Colors.primary + '10',
        borderRadius: Radius.md,
        marginBottom: Spacing.md,
    },
    progressText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    editAvatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        marginBottom: Spacing.md,
    },
    avatarActionRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    avatarActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        borderRadius: Radius.full,
    },
    avatarActionText: {
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
    },
});
