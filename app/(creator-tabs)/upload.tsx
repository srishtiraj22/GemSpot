/**
 * Creator Upload Screen — Upload your own videos
 * Only allows creators to submit their own content
 */

import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Category } from '@/constants/types';
import { CATEGORIES } from '@/constants/types';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { submitVideo } from '@/services/video-service';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreatorUploadScreen() {
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const { user } = useAuth();

    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [category, setCategory] = useState<Category>('Other');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'You must be logged in to upload.');
            return;
        }
        if (!youtubeUrl.trim()) {
            Alert.alert('Error', 'Please enter a YouTube video URL.');
            return;
        }

        setSubmitting(true);
        try {
            const result = await submitVideo({
                youtubeUrl: youtubeUrl.trim(),
                category,
                description: description.trim(),
                submittedBy: user.id,
                mode: 'creator',   // Creators upload their own content
                channelUrl: undefined,
            });

            if (result.success) {
                Alert.alert(
                    '🎉 Video Uploaded!',
                    'Your video has been successfully uploaded and is now live.',
                    [{ text: 'Great!' }],
                );
                // Reset form
                setYoutubeUrl('');
                setDescription('');
                setTags('');
                setCategory('Other');
            } else {
                Alert.alert('Upload Failed', result.error || 'Something went wrong.');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to upload video.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Upload Video</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Share your own content</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: Layout.tabBarHeight + Spacing.xl }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.form}>
                        {/* YouTube URL */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>YouTube URL *</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.cardElevated : Colors.white, borderColor: colors.border }]}>
                                <Ionicons name="logo-youtube" size={20} color={Colors.error} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="https://youtube.com/watch?v=..."
                                    placeholderTextColor={colors.textMuted}
                                    value={youtubeUrl}
                                    onChangeText={setYoutubeUrl}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="url"
                                />
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                            <TextInput
                                style={[styles.textArea, {
                                    backgroundColor: isDark ? colors.cardElevated : Colors.white,
                                    borderColor: colors.border,
                                    color: colors.text,
                                }]}
                                placeholder="Tell viewers about this video..."
                                placeholderTextColor={colors.textMuted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Tags */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
                            <TextInput
                                style={[styles.inputSingle, {
                                    backgroundColor: isDark ? colors.cardElevated : Colors.white,
                                    borderColor: colors.border,
                                    color: colors.text,
                                }]}
                                placeholder="gaming, tutorial, tips (comma separated)"
                                placeholderTextColor={colors.textMuted}
                                value={tags}
                                onChangeText={setTags}
                            />
                        </View>

                        {/* Category */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.categoryRow}>
                                    {CATEGORIES.map((c) => {
                                        const isSelected = category === c.name;
                                        return (
                                            <Pressable
                                                key={c.name}
                                                style={[
                                                    styles.categoryChip,
                                                    {
                                                        backgroundColor: isSelected
                                                            ? Colors.primary
                                                            : isDark ? colors.cardElevated : Colors.white,
                                                        borderColor: isSelected ? Colors.primary : colors.border,
                                                    },
                                                ]}
                                                onPress={() => setCategory(c.name)}
                                            >
                                                <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                                                <Text style={[
                                                    styles.categoryText,
                                                    { color: isSelected ? Colors.white : colors.text }
                                                ]}>
                                                    {c.name}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Info Note */}
                        <View style={[styles.infoBox, { backgroundColor: Colors.info + '10', borderColor: Colors.info + '30' }]}>
                            <Ionicons name="information-circle" size={18} color={Colors.info} />
                            <Text style={[styles.infoText, { color: Colors.info }]}>
                                As a creator, you can only upload your own videos. Title and thumbnail are automatically fetched from YouTube.
                            </Text>
                        </View>

                        {/* Submit Button */}
                        <Pressable
                            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload" size={20} color={Colors.white} />
                                    <Text style={styles.submitBtnText}>Upload Video</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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

    form: {
        paddingHorizontal: Layout.screenPadding,
        paddingTop: Spacing.md,
        gap: Spacing.md,
    },
    fieldGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderWidth: 1, borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md, height: Layout.inputHeight,
    },
    input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
    inputSingle: {
        borderWidth: 1, borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md, height: Layout.inputHeight,
        fontSize: 15, fontFamily: 'Inter_400Regular',
    },
    textArea: {
        borderWidth: 1, borderRadius: Radius.lg,
        paddingHorizontal: Spacing.md, paddingTop: Spacing.md,
        fontSize: 15, fontFamily: 'Inter_400Regular',
        minHeight: 100,
    },

    categoryRow: { flexDirection: 'row', gap: 8 },
    categoryChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: Radius.full, borderWidth: 1,
    },
    categoryEmoji: { fontSize: 14 },
    categoryText: { fontSize: 13, fontWeight: '600' },

    infoBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1,
    },
    infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: Colors.primary, height: 52,
        borderRadius: Radius.full, marginTop: Spacing.sm, ...Shadows.md,
    },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white, fontFamily: 'Inter_700Bold' },
});
