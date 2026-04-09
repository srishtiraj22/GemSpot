/**
 * Creator Shop — Affiliate gear marketplace with categories
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows, Layout } from '@/constants/theme';
import { MOCK_SHOP_ITEMS } from '@/constants/mock-data';
import { ProductCard } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { EmptyState } from '@/components/empty-state';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ShopCategory } from '@/constants/types';
import { useTheme } from '@/contexts/theme-context';

const SHOP_CATEGORIES: { name: ShopCategory | 'All'; icon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'All', icon: 'grid' },
    { name: 'Microphones', icon: 'mic' },
    { name: 'Cameras', icon: 'camera' },
    { name: 'Lighting', icon: 'sunny' },
    { name: 'Tripods', icon: 'easel' },
    { name: 'Editing Tools', icon: 'color-palette' },
    { name: 'Starter Kits', icon: 'gift' },
];

export default function ShopScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDark, colors } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'All'>('All');
    const [search, setSearch] = useState('');

    const filtered = MOCK_SHOP_ITEMS.filter((item) => {
        const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = search.length === 0 || item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const cardBg = isDark ? colors.cardElevated : Colors.white;
    const borderColor = isDark ? colors.border : 'rgba(0,0,0,0.04)';

    return (
        <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>🛒 Creator Shop</Text>
                <View style={{ width: 40 }} />
            </View>

            <SearchBar value={search} onChangeText={setSearch} placeholder="Search gear..." />

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {SHOP_CATEGORIES.map((cat) => (
                    <Pressable
                        key={cat.name}
                        style={[styles.catChip, { backgroundColor: cardBg, borderColor }, selectedCategory === cat.name && styles.catChipActive]}
                        onPress={() => setSelectedCategory(cat.name)}
                    >
                        <Ionicons
                            name={cat.icon}
                            size={16}
                            color={selectedCategory === cat.name ? Colors.white : colors.textMuted}
                        />
                        <Text style={[styles.catText, { color: colors.textSecondary }, selectedCategory === cat.name && styles.catTextActive]}>
                            {cat.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Starter Kit Banner */}
                {(selectedCategory === 'All' || selectedCategory === 'Starter Kits') && (
                    <Pressable style={[styles.kitBanner, Shadows.lg, { backgroundColor: cardBg, borderColor }]}>
                        <View style={styles.kitInfo}>
                            <Text style={[styles.kitTitle, { color: colors.text }]}>🎁 Creator Starter Kit</Text>
                            <Text style={[styles.kitSubtitle, { color: colors.textSecondary }]}>Everything you need to start creating</Text>
                            <Text style={styles.kitPrice}>$149.99 <Text style={[styles.kitOriginal, { color: colors.textMuted }]}>$199.99</Text></Text>
                        </View>
                        <View style={styles.kitBadge}>
                            <Ionicons name="star" size={12} color={Colors.white} />
                            <Text style={styles.kitBadgeText}>Save 25%</Text>
                        </View>
                    </Pressable>
                )}

                {/* Product Grid */}
                <View style={styles.productGrid}>
                    {filtered.length > 0 ? (
                        filtered.map((item) => (
                            <View key={item.id} style={styles.productItem}>
                                <ProductCard item={item} />
                            </View>
                        ))
                    ) : (
                        <EmptyState
                            icon="cart-outline"
                            title="No products found"
                            subtitle="Try a different category or search term"
                        />
                    )}
                </View>

                <View style={{ height: Spacing.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.backgroundLight },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    },
    backBtn: { width: 40, height: 40, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'Inter_800ExtraBold',
        fontWeight: '800',
        color: Colors.textPrimaryLight,
    },
    catRow: {
        paddingHorizontal: Layout.screenPadding, gap: Spacing.sm,
        paddingVertical: Spacing.sm,
    },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.full, backgroundColor: Colors.white,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
        ...Shadows.sm,
    },
    catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    catText: { fontSize: 14, fontFamily: 'Inter_500Medium', fontWeight: '500', color: Colors.textSecondaryLight },
    catTextActive: { color: Colors.white, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
    scrollContent: { paddingHorizontal: Layout.screenPadding },
    kitBanner: {
        backgroundColor: Colors.white,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
        position: 'relative',
        ...Shadows.sm,
    },
    kitInfo: { marginTop: Spacing.sm },
    kitTitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.textPrimaryLight,
    },
    kitSubtitle: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: Colors.textSecondaryLight,
        marginTop: 4,
    },
    kitPrice: {
        fontSize: 24,
        fontFamily: 'Inter_800ExtraBold',
        fontWeight: '800',
        color: Colors.accent,
        marginTop: Spacing.sm,
    },
    kitOriginal: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.textMutedLight,
        textDecorationLine: 'line-through',
    },
    kitBadge: {
        position: 'absolute', top: Spacing.md, right: Spacing.md,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.primary + '15', paddingHorizontal: Spacing.sm + 4,
        paddingVertical: 6, borderRadius: Radius.full,
    },
    kitBadgeText: {
        fontSize: 13,
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
        color: Colors.primary,
    },
    productGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    productItem: {
        width: '48%',
    },
});
