/**
 * Brand Deals Screen — Active campaigns, details, and apply flow
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Layout, Shadows } from '@/constants/theme';
import { MOCK_CAMPAIGNS } from '@/constants/mock-data';
import { CampaignCard } from '@/components/campaign-card';
import { EmptyState } from '@/components/empty-state';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DealFilter = 'all' | 'active' | 'applied' | 'completed';

export default function BrandDealsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState<DealFilter>('all');

    const filters: { key: DealFilter; label: string }[] = [
        { key: 'all', label: 'All Deals' },
        { key: 'active', label: 'Active' },
        { key: 'applied', label: 'Applied' },
        { key: 'completed', label: 'Completed' },
    ];

    const filteredCampaigns = filter === 'all'
        ? MOCK_CAMPAIGNS
        : MOCK_CAMPAIGNS.filter((c) => c.status === filter);

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.textPrimaryDark} />
                </Pressable>
                <Text style={styles.headerTitle}>🤝 Brand Deals</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={18} color={Colors.info} />
                <Text style={styles.infoText}>
                    Apply to brand campaigns, create content, and earn! Platform takes 10-20% commission.
                </Text>
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {filters.map((f) => (
                    <Pressable
                        key={f.key}
                        style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))
                ) : (
                    <EmptyState
                        icon="briefcase-outline"
                        title="No campaigns found"
                        subtitle={filter === 'applied'
                            ? "You haven't applied to any deals yet. Browse active campaigns to get started! 🚀"
                            : "Campaigns coming soon! Check back regularly."}
                        actionLabel={filter === 'applied' ? 'Browse Deals' : undefined}
                        onAction={filter === 'applied' ? () => setFilter('all') : undefined}
                    />
                )}
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
    infoBanner: {
        flexDirection: 'row', gap: Spacing.sm, alignItems: 'center',
        backgroundColor: Colors.primary + '10', marginHorizontal: Layout.screenPadding,
        padding: Spacing.md, borderRadius: Radius.lg, marginBottom: Spacing.lg,
        borderWidth: 1, borderColor: Colors.primary + '20',
    },
    infoText: {
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
        fontWeight: '500',
        color: Colors.primary,
        flex: 1,
        lineHeight: 18,
    },
    filterRow: { paddingHorizontal: Layout.screenPadding, gap: Spacing.sm, paddingBottom: Spacing.md },
    filterChip: {
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2,
        borderRadius: Radius.full, backgroundColor: Colors.white,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
        ...Shadows.sm,
    },
    filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    filterText: { fontSize: 14, fontFamily: 'Inter_500Medium', fontWeight: '500', color: Colors.textSecondaryLight },
    filterTextActive: { color: Colors.white, fontFamily: 'Inter_600SemiBold', fontWeight: '600' },
    scrollContent: { paddingHorizontal: Layout.screenPadding },
});
