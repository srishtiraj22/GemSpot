/**
 * Welcome Screen — Bold onboarding with tagline, gradient hero, minimal text
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();

    const bgColor = isDark ? Colors.backgroundDark : '#FAF7FF';

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: bgColor }]}>

            {/* ═══ Hero Section — Gradient diamond orb ═══ */}
            <Animated.View entering={FadeInUp.delay(100).duration(800)} style={styles.heroSection}>
                <LinearGradient
                    colors={isDark ? ['#4C1D95', '#7C3AED', '#4C1D95'] : ['#EDE9FE', '#C4B5FD', '#EDE9FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroGradient}
                >
                    {/* Floating diamond accents */}
                    <View style={styles.diamondGrid}>
                        <View style={[styles.floatingDiamond, styles.diamond1]}>
                            <Ionicons name="diamond" size={28} color={isDark ? '#A78BFA' : '#7C3AED'} />
                        </View>
                        <View style={[styles.floatingDiamond, styles.diamond2]}>
                            <Ionicons name="diamond" size={18} color={isDark ? '#C4B5FD' : '#A78BFA'} />
                        </View>
                        <View style={[styles.floatingDiamond, styles.diamond3]}>
                            <Ionicons name="diamond" size={22} color={isDark ? '#DDD6FE' : '#8B5CF6'} />
                        </View>
                        {/* Central large gem icon */}
                        <View style={styles.centralGem}>
                            <LinearGradient
                                colors={['#7C3AED', '#A78BFA']}
                                style={styles.centralGemGradient}
                            >
                                <Text style={styles.centralGemEmoji}>💎</Text>
                            </LinearGradient>
                        </View>
                        <View style={[styles.floatingDiamond, styles.diamond4]}>
                            <Ionicons name="sparkles" size={16} color={isDark ? '#FCD34D' : '#F59E0B'} />
                        </View>
                        <View style={[styles.floatingDiamond, styles.diamond5]}>
                            <Ionicons name="sparkles" size={12} color={isDark ? '#FDE68A' : '#FBBF24'} />
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* ═══ Tagline ═══ */}
            <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.taglineSection}>
                <Text style={[styles.tagline, { color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight }]}>
                    <Text style={styles.taglineAccent}>Hidden Gems</Text>
                    {'\n'}Deserve the{' '}
                    <Text style={styles.taglineAccent}>Spotlight</Text>
                </Text>
            </Animated.View>

            {/* ═══ CTA Buttons ═══ */}
            <Animated.View entering={FadeInDown.delay(700).duration(800)} style={styles.ctaSection}>
                <Pressable
                    style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                    onPress={() => router.push('/auth/signup' as any)}
                >
                    <LinearGradient
                        colors={['#7C3AED', '#5B21B6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryBtnGradient}
                    >
                        <Text style={styles.primaryBtnText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                    </LinearGradient>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.secondaryBtn,
                        {
                            backgroundColor: isDark ? 'rgba(124, 58, 237, 0.08)' : 'rgba(124, 58, 237, 0.06)',
                            borderColor: isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(124, 58, 237, 0.15)',
                        },
                        pressed && styles.btnPressed,
                    ]}
                    onPress={() => router.push('/auth/login' as any)}
                >
                    <Text style={[styles.secondaryBtnText, { color: isDark ? Colors.primaryLight : Colors.primary }]}>
                        I already have an account
                    </Text>
                </Pressable>
            </Animated.View>

            {/* Footer pill */}
            <View style={styles.footerPill} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // ─── Hero ───
    heroSection: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        flex: 1,
        maxHeight: SCREEN_WIDTH * 1.0,
    },
    heroGradient: {
        flex: 1,
        borderRadius: 32,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    diamondGrid: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingDiamond: {
        position: 'absolute',
        opacity: 0.7,
    },
    diamond1: { top: '18%', left: '15%' },
    diamond2: { top: '28%', right: '20%' },
    diamond3: { bottom: '30%', left: '22%' },
    diamond4: { top: '15%', right: '28%' },
    diamond5: { bottom: '22%', right: '15%' },
    centralGem: {
        ...Shadows.xl,
    },
    centralGemGradient: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centralGemEmoji: {
        fontSize: 42,
    },

    // ─── Tagline ───
    taglineSection: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing['2xl'],
        alignItems: 'center',
    },
    tagline: {
        fontSize: 30,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.8,
        lineHeight: 40,
    },
    taglineAccent: {
        color: '#7C3AED',
    },

    // ─── CTAs ───
    ctaSection: {
        paddingHorizontal: Spacing.xl,
        gap: Spacing.md,
        marginTop: 'auto',
        paddingBottom: Spacing.xl,
    },
    primaryBtn: {
        borderRadius: Radius.md,
        overflow: 'hidden',
        ...Shadows.glow('#7C3AED'),
    },
    primaryBtnGradient: {
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderRadius: Radius.md,
    },
    primaryBtnText: {
        fontSize: 17,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.white,
        letterSpacing: -0.2,
    },
    secondaryBtn: {
        borderRadius: Radius.md,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    secondaryBtnText: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        letterSpacing: -0.2,
    },
    btnPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },
    footerPill: {
        width: 48,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#7C3AED' + '30',
        alignSelf: 'center',
        marginBottom: Spacing.xl,
    },
});
