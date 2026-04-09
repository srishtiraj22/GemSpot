/**
 * Discover Screen — Three sections: Hidden Gems, Trending Creators, New Creators
 * Fetches real data from Firestore only — no mock data
 */

import { Colors, Layout, Radius, Shadows, Spacing } from '@/constants/theme';
import type { Video } from '@/constants/types';
import { useTheme } from '@/contexts/theme-context';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
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
const CARD_THUMB_SIZE = (SCREEN_WIDTH - 32 - 12) * 0.4;

type FilterTab = 'all' | 'trending' | 'hidden_gems' | 'new_creators';
type SortMode = 'latest' | 'trending';

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('latest');

  const fetchVideos = async () => {
    try {
      const q = query(
        collection(db, 'videos'),
        orderBy(sortMode === 'trending' ? 'voteCount' : 'createdAt', 'desc'),
        limit(50),
      );
      const snap = await getDocs(q);
      const videos = snap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];
      setAllVideos(videos);
    } catch (error) {
      console.log('Firestore fetch failed:', error);
      setAllVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, [sortMode]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  }, [sortMode]);

  const searchFiltered = useMemo(() => {
    if (!search) return allVideos;
    const q = search.toLowerCase();
    return allVideos.filter(v =>
      v.title.toLowerCase().includes(q) || v.creatorName.toLowerCase().includes(q)
    );
  }, [search, allVideos]);

  const hiddenGems = useMemo(() => {
    return searchFiltered
      .filter(v => v.subscriberCount < 1000)
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, 10);
  }, [searchFiltered]);

  const trendingCreators = useMemo(() => {
    return searchFiltered
      .slice()
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, 10);
  }, [searchFiltered]);

  const newCreators = useMemo(() => {
    return searchFiltered
      .slice()
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
      .slice(0, 10);
  }, [searchFiltered]);

  const formatSubs = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // Dynamic colors
  const cardBg = isDark ? colors.cardElevated : Colors.white;
  const borderColor = isDark ? colors.border : 'rgba(0,0,0,0.04)';
  const searchBg = isDark ? colors.cardElevated : Colors.white;

  const CreatorListCard = ({ video, rank }: { video: Video; rank?: number }) => (
    <Pressable
      style={[styles.creatorCard, { backgroundColor: cardBg, borderColor }]}
      onPress={() => router.push(`/video/${video.id}` as any)}
    >
      <View style={styles.cardThumbContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.cardThumb} />
        <View style={styles.cardPlayOverlay}>
          <Ionicons name="play-circle" size={28} color="rgba(255,255,255,0.85)" />
        </View>
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.cardNameRow}>
          {rank !== undefined && (
            <Text style={styles.cardRank}>{rank}.</Text>
          )}
          <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{video.creatorName}</Text>
        </View>
        <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
          {video.category || 'General'} · {formatSubs(video.subscriberCount)} subscribers
        </Text>
        <View style={styles.cardBottom}>
          <View style={[styles.categoryTag, { backgroundColor: isDark ? colors.card : Colors.cardLightElevated }]}>
            <Text style={[styles.categoryTagText, { color: colors.textSecondary }]}>{video.category || 'General'}</Text>
          </View>
          <View style={styles.voteBadge}>
            <Ionicons name="thumbs-up" size={13} color={Colors.primary} />
            <Text style={styles.voteText}>{video.voteCount || 0}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const SectionHead = ({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
    </View>
  );

  const showSection = (section: 'hidden_gems' | 'trending' | 'new_creators') => {
    if (activeTab === 'all') return true;
    return activeTab === section;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* ═══ SEARCH BAR ═══ */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: searchBg, borderColor }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search creators, videos..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ═══ FILTER TABS ═══ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {([
          { key: 'trending' as FilterTab, emoji: '🔥', label: 'Trending' },
          { key: 'hidden_gems' as FilterTab, emoji: '✨', label: 'Hidden Gems' },
          { key: 'new_creators' as FilterTab, emoji: '🆕', label: 'New Creators' },
        ]).map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.filterTab,
              { backgroundColor: isDark ? colors.cardElevated : Colors.white, borderColor },
              activeTab === tab.key && styles.filterTabActive,
            ]}
            onPress={() => setActiveTab(activeTab === tab.key ? 'all' : tab.key)}
          >
            <Text style={styles.filterTabEmoji}>{tab.emoji}</Text>
            <Text style={[
              styles.filterTabText,
              { color: colors.textSecondary },
              activeTab === tab.key && styles.filterTabTextActive,
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
        {/* Sort toggle */}
        <Pressable
          style={[
            styles.filterTab,
            { backgroundColor: isDark ? colors.cardElevated : Colors.white, borderColor },
          ]}
          onPress={() => setSortMode(sortMode === 'latest' ? 'trending' : 'latest')}
        >
          <Ionicons name={sortMode === 'latest' ? 'time-outline' : 'trending-up'} size={14} color={Colors.primary} />
          <Text style={[styles.filterTabText, { color: Colors.primary }]}>
            {sortMode === 'latest' ? 'Latest' : 'Trending'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* ═══ CONTENT ═══ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Loading content...</Text>
          </View>
        ) : (
          <>
            {showSection('hidden_gems') && (
              <View style={styles.section}>
                <SectionHead emoji="💎" title="Hidden Gems" />
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Small creators with amazing content</Text>
                {hiddenGems.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hidden gems found yet</Text>
                ) : (
                  hiddenGems.map((v) => <CreatorListCard key={v.id} video={v} />)
                )}
              </View>
            )}

            {showSection('trending') && (
              <View style={styles.section}>
                <SectionHead emoji="🔥" title="Trending Creators" />
                {trendingCreators.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No trending creators yet</Text>
                ) : (
                  trendingCreators.map((v, i) => <CreatorListCard key={v.id} video={v} rank={i + 1} />)
                )}
              </View>
            )}

            {showSection('new_creators') && (
              <View style={styles.section}>
                <SectionHead emoji="🆕" title="New Creators" />
                <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Recently discovered on GemSpots</Text>
                {newCreators.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No new creators found yet</Text>
                ) : (
                  newCreators.map((v) => <CreatorListCard key={v.id} video={v} />)
                )}
              </View>
            )}
          </>
        )}

        <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
    borderWidth: 1,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  tabRow: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    ...Shadows.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabEmoji: { fontSize: 14 },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  content: { paddingBottom: Spacing.md },
  section: {
    paddingTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 6,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionEmoji: { fontSize: 22 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: 14,
  },
  creatorCard: {
    flexDirection: 'row',
    marginHorizontal: Layout.screenPadding,
    marginBottom: 12,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    ...Shadows.sm,
  },
  cardThumbContainer: {
    width: CARD_THUMB_SIZE,
    height: CARD_THUMB_SIZE * 0.75,
    position: 'relative',
  },
  cardThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.cardLightElevated,
  },
  cardPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardRank: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    fontWeight: '800',
    color: Colors.accent,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    flex: 1,
  },
  cardMeta: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryTagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  voteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary + '15',
  },
  voteText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingVertical: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
});
