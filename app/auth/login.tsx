/**
 * Login Screen — Firebase Auth connected, dark mode support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout, Animation } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { signIn } = useAuth();
    const { isDark, colors } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const btnScale = useSharedValue(1);
    const btnAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnScale.value }],
    }));

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setLoading(true);
        btnScale.value = withSequence(
            withSpring(0.95, { damping: 8 }),
            withSpring(1, Animation.spring)
        );
        try {
            await signIn(email.trim(), password);
            router.replace('/(tabs)');
        } catch (e: any) {
            setError(e.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Enter Email', 'Please enter your email address first, then tap "Forgot password?".');
            return;
        }
        setResetLoading(true);
        try {
            const { resetPassword } = await import('@/services/auth-service');
            await resetPassword(email.trim());
            Alert.alert(
                'Check Your Email',
                'A password reset link has been sent to ' + email.trim() + '. Follow the link to set a new password.',
            );
        } catch (e: any) {
            const msg = e?.code === 'auth/user-not-found'
                ? 'No account found with this email.'
                : e?.message || 'Failed to send reset email. Please try again.';
            Alert.alert('Reset Failed', msg);
        } finally {
            setResetLoading(false);
        }
    };

    const bgColor = colors.background;
    const cardBg = isDark ? colors.cardElevated : Colors.white;
    const inputBg = isDark ? colors.cardElevated : Colors.textPrimaryLight + '08';
    const inputBorder = isDark ? colors.border : Colors.textPrimaryLight + '10';
    const textColor = colors.text;
    const mutedColor = colors.textMuted;

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { paddingTop: insets.top, backgroundColor: bgColor }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {/* Logo */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoEmoji}>💎</Text>
                        </View>
                        <Text style={[styles.logoText, { color: textColor }]}>GemSpots</Text>
                        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Enter your details to access your gems</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View>
                            <Text style={[styles.inputLabel, { color: textColor }]}>Email</Text>
                            <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                                <Ionicons name="mail-outline" size={18} color={mutedColor} />
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="name@example.com"
                                    placeholderTextColor={mutedColor}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View>
                            <View style={styles.passwordHeader}>
                                <Text style={[styles.inputLabel, { color: textColor }]}>Password</Text>
                                <Pressable onPress={handleForgotPassword} disabled={resetLoading}>
                                    <Text style={styles.forgotText}>{resetLoading ? 'Sending...' : 'Forgot password?'}</Text>
                                </Pressable>
                            </View>
                            <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                                <Ionicons name="lock-closed-outline" size={18} color={mutedColor} />
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="••••••••"
                                    placeholderTextColor={mutedColor}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={mutedColor} />
                                </Pressable>
                            </View>
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <AnimatedPressable style={[styles.loginBtn, btnAnimStyle]} onPress={handleLogin}>
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.loginText}>Login to GemSpots</Text>
                            )}
                        </AnimatedPressable>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: isDark ? colors.border : Colors.textPrimaryLight + '10' }]} />
                        <Text style={[styles.dividerText, { color: mutedColor }]}>Or continue with</Text>
                        <View style={[styles.dividerLine, { backgroundColor: isDark ? colors.border : Colors.textPrimaryLight + '10' }]} />
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialRow}>
                        <Pressable style={[styles.socialBtn, { backgroundColor: cardBg, borderColor: inputBorder }]}>
                            <Ionicons name="logo-google" size={20} color={textColor} />
                        </Pressable>
                        <Pressable style={[styles.socialBtn, { backgroundColor: cardBg, borderColor: inputBorder }]}>
                            <Ionicons name="logo-apple" size={20} color={textColor} />
                        </Pressable>
                        <Pressable style={[styles.socialBtn, { backgroundColor: cardBg, borderColor: inputBorder }]}>
                            <Ionicons name="logo-github" size={20} color={textColor} />
                        </Pressable>
                    </View>

                    {/* Sign Up */}
                    <View style={styles.signupRow}>
                        <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                        <Pressable onPress={() => router.push('/auth/signup')}>
                            <Text style={styles.signupLink}>Sign up for free</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center' },
    container: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xl },
    logoSection: { alignItems: 'center', marginBottom: Spacing['3xl'] },
    logoCircle: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: Colors.accent + '15',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logoEmoji: { fontSize: 28 },
    logoText: {
        fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700',
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 14, fontFamily: 'Inter_400Regular',
        marginTop: Spacing.xs, opacity: 0.6,
    },
    form: { gap: Spacing.lg },
    inputLabel: {
        fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
        marginBottom: 6, marginLeft: 4,
    },
    passwordHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        borderRadius: Radius.sm, paddingHorizontal: Spacing.md, height: 56,
        borderWidth: 1,
    },
    input: {
        flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular',
    },
    forgotText: {
        fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500',
        color: Colors.accent, marginLeft: 4,
    },
    errorText: {
        fontSize: 13, fontFamily: 'Inter_400Regular',
        color: Colors.error, textAlign: 'center',
    },
    loginBtn: {
        backgroundColor: Colors.accent, borderRadius: Radius.sm, height: 56,
        justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xs,
        ...Shadows.glow(Colors.accent),
    },
    loginText: {
        fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700', color: Colors.white,
    },
    divider: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.xl,
    },
    dividerLine: { flex: 1, height: 1 },
    dividerText: {
        fontSize: 11, fontFamily: 'Inter_500Medium', fontWeight: '500',
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
    socialRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md },
    socialBtn: {
        flex: 1, height: 52, borderRadius: Radius.sm,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1,
    },
    signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing['2xl'] },
    signupText: {
        fontSize: 14, fontFamily: 'Inter_400Regular', opacity: 0.6,
    },
    signupLink: {
        fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600', color: Colors.accent,
    },
});
