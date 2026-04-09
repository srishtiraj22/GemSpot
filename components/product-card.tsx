/**
 * ProductCard — Shop item card with image, name, price, rating, buy button
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography, Shadows, Animation } from '@/constants/theme';
import { ShopItem } from '@/constants/types';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/theme-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ProductCardProps {
    item: ShopItem;
    onPress?: () => void;
}

export function ProductCard({ item, onPress }: ProductCardProps) {
    const { isDark, colors } = useTheme();
    const cardScale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cardScale.value }],
    }));

    const cardBg = isDark ? colors.cardElevated : Colors.white;
    const borderColor = isDark ? colors.border : 'rgba(0,0,0,0.04)';

    return (
        <AnimatedPressable
            style={[styles.card, Shadows.lg, animStyle, { backgroundColor: cardBg, borderColor }]}
            onPress={onPress}
            onPressIn={() => { cardScale.value = withSpring(Animation.pressScale, Animation.spring); }}
            onPressOut={() => { cardScale.value = withSpring(1, Animation.spring); }}
        >
            {item.isBestSeller && (
                <View style={styles.bestSellerBadge}>
                    <Ionicons name="star" size={10} color={Colors.white} />
                    <Text style={styles.bestSellerText}>Best Seller</Text>
                </View>
            )}

            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>{item.description}</Text>

                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                            key={star}
                            name={star <= Math.floor(item.rating) ? 'star' : star <= item.rating + 0.5 ? 'star-half' : 'star-outline'}
                            size={12}
                            color={Colors.accent}
                        />
                    ))}
                    <Text style={[styles.reviewCount, { color: colors.textMuted }]}>({item.reviewCount.toLocaleString()})</Text>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>{item.price}</Text>
                    {item.originalPrice && (
                        <Text style={[styles.originalPrice, { color: colors.textMuted }]}>{item.originalPrice}</Text>
                    )}
                </View>

                <Pressable style={styles.buyBtn}>
                    <Ionicons name="cart-outline" size={14} color={Colors.white} />
                    <Text style={styles.buyText}>Buy Now</Text>
                </Pressable>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        width: 170,
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    bestSellerBadge: {
        position: 'absolute',
        top: Spacing.sm,
        left: Spacing.sm,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: Colors.accent,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    bestSellerText: {
        ...Typography.badge,
        color: Colors.white,
        fontSize: 9,
    },
    image: {
        width: '100%',
        height: 130,
        backgroundColor: Colors.cardLightElevated,
    },
    info: {
        padding: Spacing.sm,
    },
    name: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.textPrimaryLight,
    },
    description: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondaryLight,
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: Spacing.xs,
    },
    reviewCount: {
        fontSize: 10,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textMutedLight,
        marginLeft: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.xs,
    },
    price: {
        fontSize: 15,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.accent,
    },
    originalPrice: {
        fontSize: 11,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textMutedLight,
        textDecorationLine: 'line-through',
    },
    buyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
        marginTop: Spacing.sm,
    },
    buyText: {
        fontSize: 12,
        fontFamily: 'Inter_600SemiBold',
        fontWeight: '600',
        color: Colors.white,
    },
});
