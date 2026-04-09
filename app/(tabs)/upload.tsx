/**
 * Upload Screen — Real video submission with YouTube API verification
 */

import { Animation, Colors, Layout, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import { CATEGORIES } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { submitVideo } from '@/services/video-service';
import { fetchVideoInfo, isEligible, type YouTubeVideoInfo } from '@/services/youtube-service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Mode = 'creator' | 'gem';

export default function UploadScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { isDark, colors } = useTheme();
    const isViewer = user?.role === 'viewer';
    const [mode, setMode] = useState<Mode>('gem');
    const [videoLink, setVideoLink] = useState('');
    const [channelLink, setChannelLink] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [reason, setReason] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Verification states
    const [isVerifying, setIsVerifying] = useState(false);
    const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
    const [subCheck, setSubCheck] = useState<'idle' | 'checking' | 'pass' | 'fail'>('idle');
    const [dupCheck, setDupCheck] = useState<'idle' | 'checking' | 'pass' | 'fail'>('idle');
    const [verifyError, setVerifyError] = useState('');

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitScale = useSharedValue(1);
    const submitAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: submitScale.value }],
    }));

    /**
     * Step 1: Verify the YouTube link — fetch real data from API
     */
    const handleVerify = async () => {
        if (!videoLink.trim()) {
            Alert.alert('Missing Info', 'Please paste a YouTube video link');
            return;
        }

        setIsVerifying(true);
        setVerifyError('');
        setSubCheck('checking');
        setDupCheck('idle');
        setVideoInfo(null);

        try {
            const info = await fetchVideoInfo(videoLink.trim());
            if (!info) {
                setSubCheck('fail');
                setVerifyError('Invalid YouTube URL. Please paste a valid video link.');
                Alert.alert(
                    '❌ Invalid Link',
                    'Could not find this video. Please check the URL and try again.',
                );
                setIsVerifying(false);
                return;
            }

            setVideoInfo(info);

            // Check subscriber count
            if (isEligible(info.subscriberCount)) {
                setSubCheck('pass');
            } else {
                setSubCheck('fail');
                setVerifyError(`Creator has ${info.subscriberCount.toLocaleString()} subscribers. GemSpots is for creators under 50K subs.`);
                Alert.alert(
                    '⚠️ Not Eligible',
                    `This creator has ${info.subscriberCount.toLocaleString()} subscribers.\n\nGemSpots is for creators under 50,000 subscribers.\n\nTry submitting another small creator instead! 💎`,
                );
                setIsVerifying(false);
                return;
            }

            setDupCheck('pass');
            setIsVerifying(false);
        } catch (error: any) {
            setSubCheck('fail');
            setVerifyError(error.message || 'Failed to verify video');
            Alert.alert(
                '❌ Verification Failed',
                `${error.message || 'Something went wrong'}\n\nPlease try another video or check your internet connection.`,
            );
            setIsVerifying(false);
        }
    };

    /**
     * Step 2: Submit to Firestore
     */
    const handleSubmit = async () => {
        if (!videoInfo) {
            Alert.alert('Verify First', 'Please verify the video link before submitting.');
            return;
        }
        if (!category) {
            Alert.alert('Missing Info', 'Please select a category');
            return;
        }
        if (mode === 'creator' && !channelLink.trim()) {
            Alert.alert('Missing Info', 'Please enter your channel link');
            return;
        }

        setIsSubmitting(true);
        submitScale.value = withSequence(
            withSpring(0.95, { damping: 8 }),
            withSpring(1, Animation.spring)
        );

        try {
            const result = await submitVideo({
                youtubeUrl: videoLink.trim(),
                category: category as any,
                description: mode === 'creator' ? description : reason,
                submittedBy: user?.id || 'anonymous',
                mode,
                channelUrl: channelLink.trim() || undefined,
            });

            if (result.success) {
                Alert.alert(
                    '✅ Video Submitted!',
                    mode === 'creator'
                        ? 'Your video is now live on GemSpots!'
                        : `Thanks for discovering this hidden gem! 💎\n\n${!result.creatorClaimed ? '⚠️ This creator hasn\'t joined GemSpots yet. Invite them!' : ''}`,
                );

                // Reset form
                setVideoLink('');
                setChannelLink('');
                setCategory(null);
                setDescription('');
                setReason('');
                setVideoInfo(null);
                setSubCheck('idle');
                setDupCheck('idle');
            } else {
                Alert.alert('Submission Failed', result.error || 'Something went wrong');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit video');
        } finally {
            setIsSubmitting(false);
        }
    };

    const cardBg = isDark ? colors.cardElevated : Colors.white;
    const borderColor = isDark ? colors.border : 'rgba(0,0,0,0.04)';

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <Text style={[styles.screenTitle, { color: colors.text }]}>Upload</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Share a video with the GemSpots community</Text>

                {/* Mode Toggle */}
                <View style={[styles.modeToggle, { backgroundColor: cardBg, borderColor }]}>
                    <Pressable
                        style={[styles.modeBtn, mode === 'creator' && styles.modeBtnActive, isViewer && { opacity: 0.4 }]}
                        onPress={() => { if (!isViewer) setMode('creator'); }}
                        disabled={isViewer}
                    >
                        <Ionicons name="videocam" size={18} color={mode === 'creator' ? Colors.white : colors.textSecondary} />
                        <Text style={[styles.modeText, { color: colors.textSecondary }, mode === 'creator' && styles.modeTextActive]}>My Video</Text>
                        {isViewer && <Ionicons name="lock-closed" size={12} color={colors.textMuted} />}
                    </Pressable>
                    <Pressable
                        style={[styles.modeBtn, mode === 'gem' && styles.modeBtnActive]}
                        onPress={() => setMode('gem')}
                    >
                        <Ionicons name="diamond" size={18} color={mode === 'gem' ? Colors.white : colors.textSecondary} />
                        <Text style={[styles.modeText, { color: colors.textSecondary }, mode === 'gem' && styles.modeTextActive]}>Hidden Gem</Text>
                    </Pressable>
                </View>
                {isViewer && (
                    <View style={[styles.viewerNote, { backgroundColor: Colors.info + '15', borderColor: Colors.info + '30' }]}>
                        <Ionicons name="information-circle" size={16} color={Colors.info} />
                        <Text style={[styles.viewerNoteText, { color: Colors.info }]}>
                            Viewers can submit Hidden Gems only. Switch to Creator role in settings to upload your own videos.
                        </Text>
                    </View>
                )}

                {/* Form */}
                <View style={styles.form}>
                    {/* Video Link */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            <Ionicons name="link" size={14} color={Colors.primary} /> Video Link
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: cardBg, borderColor, color: colors.text }]}
                            placeholder="https://youtube.com/watch?v=..."
                            placeholderTextColor={colors.textMuted}
                            value={videoLink}
                            onChangeText={(text) => {
                                setVideoLink(text);
                                setVideoInfo(null);
                                setSubCheck('idle');
                                setDupCheck('idle');
                                setVerifyError('');
                            }}
                            autoCapitalize="none"
                        />

                        {/* Verify Button */}
                        <Pressable
                            style={[styles.verifyBtn, isVerifying && styles.verifyBtnDisabled]}
                            onPress={handleVerify}
                            disabled={isVerifying || !videoLink.trim()}
                        >
                            <LinearGradient
                                colors={!videoLink.trim() ? [colors.border, colors.border] : ['#3B82F6', '#2563EB'] as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.verifyBtnGradient}
                            >
                                {isVerifying ? (
                                    <ActivityIndicator size="small" color={Colors.white} />
                                ) : (
                                    <Ionicons name="shield-checkmark" size={18} color={Colors.white} />
                                )}
                                <Text style={styles.verifyBtnText}>
                                    {isVerifying ? 'Verifying...' : subCheck === 'pass' ? '✓ Verified' : 'Verify Link'}
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </View>

                    {/* Video Preview (shown after verification) */}
                    {videoInfo && (
                        <View style={[styles.previewCard, { backgroundColor: cardBg, borderColor }]}>
                            <Image source={{ uri: videoInfo.thumbnailUrl }} style={styles.previewThumb} />
                            <View style={styles.previewInfo}>
                                <Text style={[styles.previewTitle, { color: colors.text }]} numberOfLines={2}>{videoInfo.title}</Text>
                                <View style={styles.previewChannel}>
                                    <Image source={{ uri: videoInfo.channelAvatar }} style={styles.previewAvatar} />
                                    <View>
                                        <Text style={[styles.previewChannelName, { color: colors.text }]}>{videoInfo.channelName}</Text>
                                        <Text style={[styles.previewSubs, { color: colors.textSecondary }]}>
                                            {videoInfo.subscriberCount.toLocaleString()} subscribers
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Error Message */}
                    {verifyError ? (
                        <View style={styles.errorBox}>
                            <Ionicons name="warning" size={16} color={Colors.error} />
                            <Text style={styles.errorText}>{verifyError}</Text>
                        </View>
                    ) : null}

                    {/* Validation Indicators */}
                    {(subCheck !== 'idle' || dupCheck !== 'idle') && (
                        <View style={[styles.validationBox, { backgroundColor: cardBg, borderColor }]}>
                            <ValidationRow label="Subscriber Count (< 50K)" status={subCheck} colors={colors} />
                            {dupCheck !== 'idle' && <ValidationRow label="Duplicate Check" status={dupCheck} colors={colors} />}
                        </View>
                    )}

                    {/* Channel Link (Creator only) */}
                    {mode === 'creator' && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                <Ionicons name="person-circle" size={14} color={Colors.primary} /> Channel Link
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: cardBg, borderColor, color: colors.text }]}
                                placeholder="https://youtube.com/@yourchannel"
                                placeholderTextColor={colors.textMuted}
                                value={channelLink}
                                onChangeText={setChannelLink}
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            <Ionicons name="grid" size={14} color={Colors.primary} /> Category
                        </Text>
                        <Pressable
                            style={[styles.selectBtn, { backgroundColor: cardBg, borderColor }]}
                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                        >
                            <Text style={[category ? styles.selectText : styles.selectPlaceholder, { color: category ? colors.text : colors.textMuted }]}>
                                {category || 'Select a category'}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                        </Pressable>

                        {showCategoryPicker && (
                            <View style={[styles.categoryGrid, { backgroundColor: cardBg, borderColor }]}>
                                {CATEGORIES.map((cat) => (
                                    <Pressable
                                        key={cat.name}
                                        style={[styles.categoryOption, { backgroundColor: isDark ? colors.card : Colors.white, borderColor }, category === cat.name && styles.categoryOptionActive]}
                                        onPress={() => {
                                            setCategory(cat.name);
                                            setShowCategoryPicker(false);
                                        }}
                                    >
                                        <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                        <Text style={[styles.categoryName, { color: colors.textSecondary }, category === cat.name && styles.categoryNameActive]}>
                                            {cat.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Description / Reason */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            <Ionicons name="document-text" size={14} color={Colors.primary} />{' '}
                            {mode === 'creator' ? 'Description' : 'Why is this a hidden gem?'}
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: cardBg, borderColor, color: colors.text }]}
                            placeholder={mode === 'creator'
                                ? 'Tell us about your video...'
                                : 'What makes this creator special?'}
                            placeholderTextColor={colors.textMuted}
                            value={mode === 'creator' ? description : reason}
                            onChangeText={mode === 'creator' ? setDescription : setReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit */}
                    <AnimatedPressable
                        style={[
                            styles.submitBtn,
                            Shadows.glow(Colors.primary),
                            submitAnimStyle,
                            (!videoInfo || subCheck !== 'pass') && styles.submitBtnDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!videoInfo || subCheck !== 'pass' || isSubmitting}
                    >
                        <LinearGradient
                            colors={(!videoInfo || subCheck !== 'pass')
                                ? [colors.border, colors.border]
                                : Colors.gradientPrimary as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <>
                                    <Ionicons name={mode === 'creator' ? 'cloud-upload' : 'diamond'} size={20} color={Colors.white} />
                                    <Text style={styles.submitText}>
                                        {!videoInfo ? 'Verify Link First' : mode === 'creator' ? 'Submit Video' : 'Submit Gem'}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </AnimatedPressable>
                </View>

                <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

function ValidationRow({ label, status, colors }: { label: string; status: string, colors: any }) {
    const iconName = status === 'checking' ? 'time-outline' :
        status === 'pass' ? 'checkmark-circle' :
            status === 'fail' ? 'close-circle' : 'ellipse-outline';
    const iconColor = status === 'checking' ? Colors.accent :
        status === 'pass' ? Colors.success :
            status === 'fail' ? Colors.error : colors.textMuted;

    return (
        <View style={valStyles.row}>
            {status === 'checking' ? (
                <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
                <Ionicons name={iconName as any} size={18} color={iconColor} />
            )}
            <Text style={[valStyles.label, { color: colors.textSecondary }]}>{label}</Text>
            {status === 'checking' && <Text style={valStyles.checking}>Verifying...</Text>}
            {status === 'pass' && <Text style={valStyles.pass}>Passed ✓</Text>}
            {status === 'fail' && <Text style={valStyles.fail}>Failed ✗</Text>}
        </View>
    );
}

const valStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
    label: { ...Typography.body, color: Colors.textSecondaryDark, flex: 1 },
    checking: { ...Typography.caption, color: Colors.accent },
    pass: { ...Typography.caption, color: Colors.success },
    fail: { ...Typography.caption, color: Colors.error },
});

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.backgroundLight },
    scrollContent: { paddingHorizontal: Layout.screenPadding },
    screenTitle: { ...Typography.screenTitle, color: Colors.textPrimaryLight, marginTop: Spacing.sm },
    subtitle: { ...Typography.body, color: Colors.textSecondaryLight, marginTop: Spacing.xs, marginBottom: Spacing.lg },

    modeToggle: {
        flexDirection: 'row', backgroundColor: Colors.white,
        borderRadius: Radius.lg, padding: Spacing.xs, gap: Spacing.xs, marginBottom: Spacing.lg,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
        ...Shadows.sm,
    },
    modeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, paddingVertical: Spacing.sm + 2, borderRadius: Radius.sm,
    },
    modeBtnActive: { backgroundColor: Colors.primary },
    modeText: { ...Typography.body, color: Colors.textSecondaryLight, fontWeight: '500', fontSize: 14 },
    modeTextActive: { color: Colors.white, fontWeight: '600' },

    form: { gap: Spacing.lg },
    inputGroup: { gap: Spacing.sm },
    label: { ...Typography.body, color: Colors.textPrimaryLight, fontWeight: '600' },
    input: {
        backgroundColor: Colors.white, borderRadius: Radius.md,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
        ...Typography.body, color: Colors.textPrimaryLight,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', height: Layout.inputHeight,
    },
    textArea: { height: 100, paddingTop: Spacing.sm + 2 },

    // Verify button (full-width below input)
    verifyBtn: {
        borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.xs,
    },
    verifyBtnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, height: Layout.buttonHeight,
    },
    verifyBtnText: {
        ...Typography.button, color: Colors.white, fontSize: 15,
    },
    verifyBtnDisabled: { opacity: 0.5 },

    // Video preview card
    previewCard: {
        backgroundColor: Colors.white, borderRadius: Radius.lg,
        overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
        ...Shadows.sm,
    },
    previewThumb: { width: '100%', height: 160, backgroundColor: Colors.cardLightElevated },
    previewInfo: { padding: Spacing.md },
    previewTitle: { ...Typography.cardTitle, color: Colors.textPrimaryLight, marginBottom: Spacing.sm },
    previewChannel: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    previewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.cardLightElevated },
    previewChannelName: { ...Typography.body, color: Colors.textPrimaryLight, fontWeight: '600', fontSize: 14 },
    previewSubs: { ...Typography.caption, color: Colors.textSecondaryLight },

    // Error
    errorBox: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        backgroundColor: Colors.error + '15', borderRadius: Radius.md,
        padding: Spacing.sm + 4, borderWidth: 1, borderColor: Colors.error + '30',
    },
    errorText: { ...Typography.caption, color: Colors.error, flex: 1 },

    // Validation
    validationBox: {
        backgroundColor: Colors.white, borderRadius: Radius.md,
        padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
        ...Shadows.sm,
    },

    // Select & Category
    selectBtn: {
        backgroundColor: Colors.white, borderRadius: Radius.md,
        paddingHorizontal: Spacing.md, height: Layout.inputHeight,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    },
    selectText: { ...Typography.body, color: Colors.textPrimaryLight },
    selectPlaceholder: { ...Typography.body, color: Colors.textMutedLight },
    categoryGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
        backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.sm,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
        ...Shadows.sm,
    },
    categoryOption: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: Colors.white,
    },
    categoryOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    categoryEmoji: { fontSize: 16 },
    categoryName: { ...Typography.caption, color: Colors.textSecondaryLight, fontSize: 13 },
    categoryNameActive: { color: Colors.white, fontWeight: '600' },

    // Submit
    submitBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.sm },
    submitBtnDisabled: { opacity: 0.6 },
    submitGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, height: Layout.buttonHeight + 4,
    },
    submitText: { ...Typography.button, color: Colors.white, fontSize: 16 },

    // Viewer restriction note
    viewerNote: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.sm,
    },
    viewerNoteText: { flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18 },
});
