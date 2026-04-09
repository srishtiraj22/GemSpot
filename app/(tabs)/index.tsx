import { CategoryChip } from '@/components/category-chip';
import { Colors, Layout, Radius, Spacing } from '@/constants/theme';
import type { Video } from '@/constants/types';
import { CATEGORIES } from '@/constants/types';
import { useTheme } from '@/contexts/theme-context';
import { db } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
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

/** Gem Score formula: based on upvotes, comments, YT views */
export function computeGemScore(v: Video): number {
  const nUp = Math.min(5, (v.voteCount || 0) / 100);
  const nComm = Math.min(5, (v.commentCount || 0) / 20);
  const nViews = Math.min(5, (v.viewsFromPlatform || 0) / 1000);
  const raw = (nUp * 0.4 + nComm * 0.3 + nViews * 0.3) * 2;
  return Math.min(10, parseFloat(Math.max(0.1, raw).toFixed(1)));
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(30));
      const videosSnap = await getDocs(videosQuery);
      const videos = videosSnap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];
      setAllVideos(videos);
    } catch (error) {
      console.log('Firestore fetch failed:', error);
      setAllVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const filteredVideos = allVideos.filter(v => {
    if (selectedCategory && v.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.title.toLowerCase().includes(q) || v.creatorName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* ═══ HEADER ═══ */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoIcon}>💎</Text>
          <Text style={[styles.logo, { color: colors.text }]}>
            Gem<Text style={styles.logoAccent}>Spots</Text>
          </Text>
        </View>
        <Pressable style={[styles.searchBar, {
          backgroundColor: isDark ? colors.cardElevated : Colors.white,
          borderColor: isDark ? colors.border : 'rgba(0,0,0,0.04)',
        }]}>
          <Ionicons name="search" size={16} color={Colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search creators..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Pressable>
      </View>

      {/* ═══ CATEGORY CHIPS ═══ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <CategoryChip
          name="All"
          emoji="🔥"
          isSelected={selectedCategory === null}
          onPress={() => setSelectedCategory(null)}
        />
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.name}
            name={cat.name}
            emoji={cat.emoji}
            isSelected={selectedCategory === cat.name}
            onPress={() => setSelectedCategory(cat.name)}
          />
        ))}
      </ScrollView>

      {/* ═══ VERTICAL VIDEO FEED ═══ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
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
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Loading videos...</Text>
          </View>
        ) : filteredVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-off-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No videos found</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Try a different category or search term</Text>
          </View>
        ) : (
          filteredVideos.map((video) => {
            const score = computeGemScore(video);
            return (
              <Pressable
                key={video.id}
                style={styles.videoCard}
                onPress={() => router.push(`/video/${video.id}` as any)}
              >
                {/* Thumbnail */}
                <View style={[styles.thumbContainer, {
                  backgroundColor: isDark ? colors.cardElevated : Colors.cardLightElevated,
                }]}>
                  <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} />
                  {/* GemScore Badge — top-right */}
                  <View style={styles.gemScoreBadge}>
                    <Ionicons name="diamond" size={11} color={Colors.white} />
                    <Text style={styles.gemScoreText}>{score}</Text>
                  </View>
                  {/* Play overlay */}
                  <View style={styles.playOverlay}>
                    <View style={styles.playCircle}>
                      <Ionicons name="play" size={24} color={Colors.white} />
                    </View>
                  </View>
                  {/* Views badge */}
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>
                      {video.viewsFromPlatform ? `${(video.viewsFromPlatform / 1000).toFixed(1)}K` : '0'}
                    </Text>
                  </View>
                </View>
                {/* Video Info Row */}
                <View style={styles.infoRow}>
                  <Image source={{ uri: video.creatorAvatar }} style={styles.avatarSmall} />
                  <View style={styles.infoText}>
                    <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>{video.title}</Text>
                    <Text style={[styles.videoMeta, { color: colors.textMuted }]}>
                      {video.creatorName} · {(video.viewsFromPlatform || 0).toLocaleString()} views
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
        <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
    gap: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoIcon: { fontSize: 22 },
  logo: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  logoAccent: { color: Colors.primary },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    height: 36,
    gap: 6,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  chipRow: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  feedContent: { paddingBottom: Spacing.md },
  videoCard: { marginBottom: 20 },
  thumbContainer: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    height: (SCREEN_WIDTH - Spacing.lg * 2) * 0.5625,
    position: 'relative',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
  },
  thumbnail: { width: '100%', height: '100%' },
  gemScoreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary + 'E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  gemScoreText: { fontSize: 12, fontWeight: '800', color: Colors.white },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: { fontSize: 11, fontWeight: '600', color: Colors.white },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 10,
    gap: 12,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  infoText: { flex: 1 },
  videoTitle: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  videoMeta: { fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 13 },
});
