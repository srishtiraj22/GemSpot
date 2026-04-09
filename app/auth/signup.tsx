/**
 * Signup Screen — Firebase Auth connected, dark mode support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout, Animation } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Role = 'viewer' | 'creator';

const ROLES: { key: Role; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'viewer', title: 'Viewer', desc: 'Explore spots', icon: 'eye' },
    { key: 'creator', title: 'Creator', desc: 'Share gems', icon: 'compass' },

];

export default function SignupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { signUp } = useAuth();
    const { isDark, colors } = useTheme();
    const [role, setRole] = useState<Role>('creator');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [channelUrl, setChannelUrl] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const btnScale = useSharedValue(1);
    const btnAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnScale.value }],
    }));

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        if (role === 'creator' && !channelUrl.trim()) {
            setError('Please provide your YouTube channel URL');
            return;
        }
        setError('');
        setLoading(true);
        btnScale.value = withSequence(
            withSpring(0.95, { damping: 8 }),
            withSpring(1, Animation.spring)
        );
        try {
            await signUp(
                email.trim(),
                password,
                name.trim(),
                role,
                role === 'creator' ? channelUrl.trim() : undefined
            );
            router.replace('/(tabs)');
        } catch (e: any) {
            setError(e.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const bgColor = colors.background;
    const inputBg = isDark ? colors.cardElevated : Colors.white;
    const inputBorder = isDark ? colors.border : Colors.borderLight;
    const textColor = colors.text;
    const mutedColor = colors.textMuted;

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: bgColor }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={textColor} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Create Account</Text>
                    <View style={{ width: 48 }} />
                </View>

                {/* Heading */}
                <Text style={[styles.title, { color: textColor }]}>Join GemSpots</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Select your account type and fill in your details to start discovering gems.
                </Text>

                {/* Account Type Cards */}
                <View style={styles.roleRow}>
                    {ROLES.map((r) => {
                        const isActive = role === r.key;
                        return (
                            <Pressable
                                key={r.key}
                                style={styles.roleCard}
                                onPress={() => setRole(r.key)}
                            >
                                <View style={[
                                    styles.roleIconContainer,
                                    { backgroundColor: isDark ? colors.cardElevated : Colors.cardLightElevated },
                                    isActive && styles.roleIconActive,
                                ]}>
                                    <Ionicons
                                        name={r.icon}
                                        size={28}
                                        color={isActive ? Colors.accent : mutedColor}
                                    />
                                </View>
                                <Text style={[styles.roleTitle, { color: isActive ? textColor : colors.textSecondary }]}>{r.title}</Text>
                                <Text style={[styles.roleDesc, { color: mutedColor }]}>{r.desc}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <View>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                            placeholder="Enter your full name"
                            placeholderTextColor={mutedColor}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                            placeholder="you@example.com"
                            placeholderTextColor={mutedColor}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                        <View style={[styles.passwordContainer, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                            <TextInput
                                style={[styles.input, { flex: 1, borderWidth: 0, color: textColor }]}
                                placeholder="••••••••"
                                placeholderTextColor={mutedColor}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <Pressable
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeBtn}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={18}
                                    color={mutedColor}
                                />
                            </Pressable>
                        </View>
                    </View>

                    {role === 'creator' && (
                        <View>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>YouTube Channel URL</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                                placeholder="https://youtube.com/@yourchannel"
                                placeholderTextColor={mutedColor}
                                value={channelUrl}
                                onChangeText={setChannelUrl}
                                autoCapitalize="none"
                            />
                        </View>
                    )}
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* CTA */}
                <View style={styles.ctaSection}>
                    <AnimatedPressable style={[styles.signupBtn, btnAnimStyle]} onPress={handleSignup}>
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.signupBtnText}>Create Account</Text>
                        )}
                    </AnimatedPressable>

                    <View style={styles.loginRow}>
                        <Text style={[styles.loginText, { color: mutedColor }]}>Already have an account? </Text>
                        <Pressable onPress={() => router.push('/auth/login')}>
                            <Text style={styles.loginLink}>Log in</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Terms */}
                <View style={styles.termsSection}>
                    <Text style={[styles.termsText, { color: mutedColor }]}>
                        By signing up, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { paddingBottom: Spacing['3xl'] },
    headerRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    },
    backBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
    headerTitle: {
        flex: 1, textAlign: 'center', fontSize: 17,
        fontFamily: 'Inter_600SemiBold', fontWeight: '600', letterSpacing: -0.3,
    },
    title: {
        fontSize: 30, fontFamily: 'Inter_700Bold', fontWeight: '700',
        paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15, fontFamily: 'Inter_400Regular',
        paddingHorizontal: Spacing.md, paddingTop: Spacing.xs,
        paddingBottom: Spacing.md, lineHeight: 22,
    },
    roleRow: {
        flexDirection: 'row', gap: Spacing.sm,
        paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
    },
    roleCard: { flex: 1, gap: Spacing.sm, paddingBottom: Spacing.sm },
    roleIconContainer: {
        width: '100%', aspectRatio: 1, borderRadius: Radius.md,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'transparent',
    },
    roleIconActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '10' },
    roleTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
    roleDesc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
    form: { gap: Spacing.lg, paddingHorizontal: Spacing.md },
    inputLabel: {
        fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500',
        marginBottom: Spacing.sm,
    },
    input: {
        borderRadius: Radius.md, borderWidth: 1, height: 56,
        paddingHorizontal: Spacing.md, fontSize: 15, fontFamily: 'Inter_400Regular',
    },
    passwordContainer: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: Radius.md, borderWidth: 1, paddingRight: Spacing.sm,
    },
    eyeBtn: { padding: Spacing.sm },
    errorText: {
        fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.error,
        textAlign: 'center', marginTop: Spacing.md, paddingHorizontal: Spacing.md,
    },
    ctaSection: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
    signupBtn: {
        backgroundColor: Colors.accent, borderRadius: Radius.md, height: 56,
        justifyContent: 'center', alignItems: 'center',
        ...Shadows.glow(Colors.accent),
    },
    signupBtnText: {
        fontSize: 17, fontFamily: 'Inter_700Bold', fontWeight: '700', color: Colors.white,
    },
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
    loginText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
    loginLink: {
        fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600', color: Colors.accent,
    },
    termsSection: {
        paddingHorizontal: Spacing.xl + Spacing.md, paddingTop: Spacing.xl, paddingBottom: Spacing.lg,
    },
    termsText: {
        fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 16,
    },
    termsLink: { textDecorationLine: 'underline' },
});
