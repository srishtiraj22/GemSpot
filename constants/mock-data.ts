/**
 * GemSpots — Mock Data
 * Sample data for UI development. Uses real YouTube video IDs.
 */

import { Video, Creator, Campaign, User, Badge, ShopItem, Comment, LeaderboardEntry } from './types';

// ─── Current User ──────────────────────────────────────────────────────────
export const MOCK_USER: User = {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex@gemspots.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'creator',
    points: 2450,
    level: 3,
    xp: 450,
    xpToNext: 600,
    streak: 7,
    badges: [],
    votesToday: 8,
    maxVotesPerDay: 20,
    joinedAt: '2025-11-15',
};

// ─── Badges ────────────────────────────────────────────────────────────────
export const ALL_BADGES: Badge[] = [
    { id: 'b1', name: 'Gem Hunter', icon: '💎', description: 'Discovered 10 hidden gems early.', earnedAt: '2025-12-01', isLocked: false },
    { id: 'b2', name: 'Rising Scout', icon: '🔭', description: 'Upvoted 50 videos that gained traction.', earnedAt: '2025-12-15', isLocked: false },
    { id: 'b3', name: 'Streak Master', icon: '🔥', description: 'Voted for videos 7 days in a row.', earnedAt: '2026-01-05', isLocked: false },
    { id: 'b4', name: 'Trendsetter', icon: '📈', description: 'One of your submitted videos went trending.', isLocked: true },
    { id: 'b7', name: 'Content King', icon: '👑', description: 'Reached #1 on the leaderboard.', isLocked: true },
];

// ─── Creators ──────────────────────────────────────────────────────────────
export const MOCK_CREATORS: Creator[] = [
    {
        id: 'c1', name: 'TechTinyTalks', avatar: 'https://i.pravatar.cc/150?img=1',
        channelId: 'UC_techtinytalks', channelUrl: 'https://youtube.com/@techtinytalks',
        subscriberCount: 3200, claimed: true, userId: 'u1',
        totalVotes: 1845, totalViews: 28400, rank: 1, growthPercent: 18.5,
        isVerified: true, joinedAt: '2025-10-01', videosCount: 12,
        badges: [ALL_BADGES[0], ALL_BADGES[2]], level: 5, xp: 780, xpToNext: 1000,
    },
    {
        id: 'c2', name: 'ComedyCrush', avatar: 'https://i.pravatar.cc/150?img=2',
        channelId: 'UC_comedycrush', channelUrl: 'https://youtube.com/@comedycrush',
        subscriberCount: 1850, claimed: true, userId: 'u2',
        totalVotes: 1320, totalViews: 19200, rank: 2, growthPercent: 24.2,
        isVerified: true, joinedAt: '2025-10-15', videosCount: 8,
        badges: [ALL_BADGES[1]], level: 4, xp: 560, xpToNext: 800,
    },
    {
        id: 'c3', name: 'GamingGrit', avatar: 'https://i.pravatar.cc/150?img=3',
        channelId: 'UC_gaminggrit', channelUrl: 'https://youtube.com/@gaminggrit',
        subscriberCount: 4500, claimed: true, userId: 'u3',
        totalVotes: 1100, totalViews: 15800, rank: 3, growthPercent: 12.1,
        isVerified: true, joinedAt: '2025-11-01', videosCount: 15,
        badges: [ALL_BADGES[0], ALL_BADGES[4]], level: 4, xp: 490, xpToNext: 800,
    },
    {
        id: 'c4', name: 'CookWithSara', avatar: 'https://i.pravatar.cc/150?img=5',
        channelId: 'UC_cookwithsara', channelUrl: 'https://youtube.com/@cookwithsara',
        subscriberCount: 890, claimed: true, userId: 'u4',
        totalVotes: 920, totalViews: 11500, rank: 4, growthPercent: 31.4,
        isVerified: true, joinedAt: '2025-11-20', videosCount: 6,
        badges: [ALL_BADGES[2]], level: 3, xp: 380, xpToNext: 600,
    },
    {
        id: 'c5', name: 'MusicMinute', avatar: 'https://i.pravatar.cc/150?img=8',
        channelId: 'UC_musicminute', channelUrl: 'https://youtube.com/@musicminute',
        subscriberCount: 2100, claimed: false, userId: null,
        totalVotes: 780, totalViews: 9800, rank: 5, growthPercent: 8.9,
        isVerified: false, joinedAt: '2025-12-01', videosCount: 10,
        badges: [], level: 2, xp: 210, xpToNext: 400,
    },
    {
        id: 'c6', name: 'ScienceSnap', avatar: 'https://i.pravatar.cc/150?img=11',
        channelId: 'UC_sciencesnap', channelUrl: 'https://youtube.com/@sciencesnap',
        subscriberCount: 430, claimed: false, userId: null,
        totalVotes: 650, totalViews: 7200, rank: 6, growthPercent: 42.0,
        isVerified: false, joinedAt: '2025-12-10', videosCount: 5,
        badges: [ALL_BADGES[4]], level: 2, xp: 180, xpToNext: 400,
    },
];

// ─── Videos ────────────────────────────────────────────────────────────────
export const MOCK_VIDEOS: Video[] = [
    {
        id: 'v1', youtubeVideoId: 'dQw4w9WgXcQ', title: '10 Budget Tech Gadgets That Changed My Setup',
        description: 'I tested 10 affordable tech gadgets and these are the ones worth buying.',
        category: 'Tech', thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        creatorId: 'c1', creatorName: 'TechTinyTalks', creatorAvatar: 'https://i.pravatar.cc/150?img=1',
        subscriberCount: 3200, voteCount: 342, voters: [], commentCount: 28, viewsFromPlatform: 1580,
        ratings: { editing: 4.5, audio: 4.2, content: 4.8, average: 4.5 },
        submittedBy: 'creator', submittedAt: '2026-02-28', isFeatured: false,
        isTrending: true, isGemOfDay: true, tags: ['tech', 'budget', 'gadgets'],
    },
    {
        id: 'v2', youtubeVideoId: 'jNQXAC9IVRw', title: 'Why Nobody Talks About This Editing Trick',
        description: 'A game-changing editing technique that pros use but nobody teaches.',
        category: 'Tech', thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
        creatorId: 'c1', creatorName: 'TechTinyTalks', creatorAvatar: 'https://i.pravatar.cc/150?img=1',
        subscriberCount: 3200, voteCount: 287, voters: [], commentCount: 19, viewsFromPlatform: 1200,
        ratings: { editing: 4.8, audio: 4.0, content: 4.5, average: 4.4 },
        submittedBy: 'creator', submittedAt: '2026-02-25', isFeatured: true,
        isTrending: true, isGemOfDay: false, tags: ['editing', 'tutorial'],
    },
    {
        id: 'v3', youtubeVideoId: '9bZkp7q19f0', title: 'I Tried Stand-Up Comedy for the First Time',
        description: 'My first ever attempt at stand-up comedy – and it went surprisingly well!',
        category: 'Comedy', thumbnailUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
        creatorId: 'c2', creatorName: 'ComedyCrush', creatorAvatar: 'https://i.pravatar.cc/150?img=2',
        subscriberCount: 1850, voteCount: 456, voters: [], commentCount: 45, viewsFromPlatform: 2100,
        ratings: { editing: 3.8, audio: 4.0, content: 4.9, average: 4.2 },
        submittedBy: 'creator', submittedAt: '2026-02-27', isFeatured: false,
        isTrending: true, isGemOfDay: false, tags: ['comedy', 'standup'],
    },
    {
        id: 'v4', youtubeVideoId: 'kJQP7kiw5Fk', title: 'This Mobile Game is UNDERRATED',
        description: 'Found this incredible mobile game that nobody knows about.',
        category: 'Gaming', thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        creatorId: 'c3', creatorName: 'GamingGrit', creatorAvatar: 'https://i.pravatar.cc/150?img=3',
        subscriberCount: 4500, voteCount: 198, voters: [], commentCount: 12, viewsFromPlatform: 890,
        ratings: { editing: 4.2, audio: 4.5, content: 4.0, average: 4.2 },
        submittedBy: 'creator', submittedAt: '2026-03-01', isFeatured: false,
        isTrending: false, isGemOfDay: false, tags: ['gaming', 'mobile', 'review'],
    },
    {
        id: 'v5', youtubeVideoId: 'RgKAFK5djSk', title: '5 Minute Pasta That Tastes Like Restaurant',
        description: 'Quick and easy pasta recipe that looks and tastes fancy.',
        category: 'Cooking', thumbnailUrl: 'https://img.youtube.com/vi/RgKAFK5djSk/hqdefault.jpg',
        creatorId: 'c4', creatorName: 'CookWithSara', creatorAvatar: 'https://i.pravatar.cc/150?img=5',
        subscriberCount: 890, voteCount: 521, voters: [], commentCount: 38, viewsFromPlatform: 2800,
        ratings: { editing: 4.0, audio: 3.8, content: 4.9, average: 4.2 },
        submittedBy: 'u1', submittedAt: '2026-02-20', isFeatured: true,
        isTrending: true, isGemOfDay: false, tags: ['cooking', 'quick', 'recipe'],
    },
    {
        id: 'v6', youtubeVideoId: 'OPf0YbXqDm0', title: 'Acoustic Cover That Will Give You Chills',
        description: 'A raw acoustic cover that hits different at night.',
        category: 'Music', thumbnailUrl: 'https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg',
        creatorId: 'c5', creatorName: 'MusicMinute', creatorAvatar: 'https://i.pravatar.cc/150?img=8',
        subscriberCount: 2100, voteCount: 312, voters: [], commentCount: 22, viewsFromPlatform: 1400,
        ratings: { editing: 3.5, audio: 4.9, content: 4.6, average: 4.3 },
        submittedBy: 'creator', submittedAt: '2026-03-02', isFeatured: false,
        isTrending: false, isGemOfDay: false, tags: ['music', 'acoustic', 'cover'],
    },
    {
        id: 'v7', youtubeVideoId: 'fJ9rUzIMcZQ', title: 'How Black Holes Actually Work (Simple)',
        description: 'I explain black holes in the simplest way possible.',
        category: 'Science', thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
        creatorId: 'c6', creatorName: 'ScienceSnap', creatorAvatar: 'https://i.pravatar.cc/150?img=11',
        subscriberCount: 430, voteCount: 289, voters: [], commentCount: 15, viewsFromPlatform: 950,
        ratings: { editing: 4.3, audio: 4.1, content: 4.8, average: 4.4 },
        submittedBy: 'creator', submittedAt: '2026-03-03', isFeatured: false,
        isTrending: false, isGemOfDay: false, tags: ['science', 'space', 'education'],
    },
    {
        id: 'v8', youtubeVideoId: 'L_jWHffIx5E', title: 'Day in My Life as a Solo Traveler in Japan',
        description: 'Exploring Tokyo alone with just a backpack and camera.',
        category: 'Travel', thumbnailUrl: 'https://img.youtube.com/vi/L_jWHffIx5E/hqdefault.jpg',
        creatorId: 'c2', creatorName: 'ComedyCrush', creatorAvatar: 'https://i.pravatar.cc/150?img=2',
        subscriberCount: 1850, voteCount: 175, voters: [], commentCount: 9, viewsFromPlatform: 680,
        ratings: { editing: 4.6, audio: 4.2, content: 4.4, average: 4.4 },
        submittedBy: 'u1', submittedAt: '2026-02-18', isFeatured: false,
        isTrending: false, isGemOfDay: false, tags: ['travel', 'japan', 'vlog'],
    },
];

// ─── Comments ──────────────────────────────────────────────────────────────
export const MOCK_COMMENTS: Comment[] = [
    { id: 'cm1', userId: 'u2', userName: 'JamieK', userAvatar: 'https://i.pravatar.cc/150?img=15', text: 'This is exactly what I needed! 🙌', createdAt: '2026-03-03T10:30:00Z', likes: 12 },
    { id: 'cm2', userId: 'u3', userName: 'SophieM', userAvatar: 'https://i.pravatar.cc/150?img=20', text: 'Subscribed instantly. How is this channel so small??', createdAt: '2026-03-03T09:15:00Z', likes: 8 },
    { id: 'cm3', userId: 'u4', userName: 'DanTheMan', userAvatar: 'https://i.pravatar.cc/150?img=33', text: 'The editing quality is insane for a small creator', createdAt: '2026-03-02T22:00:00Z', likes: 15 },
    { id: 'cm4', userId: 'u5', userName: 'CreativeKat', userAvatar: 'https://i.pravatar.cc/150?img=25', text: 'Found my new favorite channel through GemSpots 💎', createdAt: '2026-03-02T18:45:00Z', likes: 6 },
    { id: 'cm5', userId: 'u6', userName: 'MaxGamer', userAvatar: 'https://i.pravatar.cc/150?img=50', text: 'Underrated content, keep going!', createdAt: '2026-03-01T14:20:00Z', likes: 4 },
];

// ─── Campaigns ─────────────────────────────────────────────────────────────
export const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: 'camp1', brandId: 'br1', brandName: 'TechNova', brandLogo: 'https://i.pravatar.cc/150?img=60',
        title: 'Review Our New Wireless Earbuds', description: 'Looking for tech creators to review our latest noise-cancelling earbuds.',
        budget: '$150 - $300', category: 'Tech', requirements: ['Min 500 subs', 'Tech niche', '60+ second review', 'Honest opinion'],
        deadline: '2026-03-15', applicantsCount: 12, maxCreators: 5, status: 'active',
    },
    {
        id: 'camp2', brandId: 'br2', brandName: 'FitFuel', brandLogo: 'https://i.pravatar.cc/150?img=61',
        title: 'Fitness Product Integration', description: 'Show our protein bars in your workout routine videos.',
        budget: '$100 - $200', category: 'Fitness', requirements: ['Min 200 subs', 'Fitness content', 'Natural integration'],
        deadline: '2026-03-20', applicantsCount: 8, maxCreators: 3, status: 'active',
    },
    {
        id: 'camp3', brandId: 'br3', brandName: 'GameZone', brandLogo: 'https://i.pravatar.cc/150?img=62',
        title: 'Mobile Game Launch Campaign', description: 'Play and review our new RPG mobile game in a 5-min video.',
        budget: '$200 - $500', category: 'Gaming', requirements: ['Min 1K subs', 'Gaming channel', '5+ min video', 'Include download link'],
        deadline: '2026-04-01', applicantsCount: 22, maxCreators: 10, status: 'active',
    },
];

// ─── Shop Items ────────────────────────────────────────────────────────────
export const MOCK_SHOP_ITEMS: ShopItem[] = [
    {
        id: 's1', name: 'Blue Yeti Nano', description: 'Premium USB microphone for creators',
        price: '$99.99', originalPrice: '$129.99', image: 'https://i.pravatar.cc/300?img=1',
        category: 'Microphones', rating: 4.7, reviewCount: 2340, isBestSeller: true,
        affiliateUrl: 'https://amzn.to/example1',
    },
    {
        id: 's2', name: 'Logitech C920 HD', description: 'Full HD webcam with autofocus',
        price: '$79.99', image: 'https://i.pravatar.cc/300?img=2',
        category: 'Cameras', rating: 4.5, reviewCount: 5120, isBestSeller: true,
        affiliateUrl: 'https://amzn.to/example2',
    },
    {
        id: 's3', name: 'Neewer 660 LED Panel', description: 'Professional bi-color video light',
        price: '$45.99', originalPrice: '$59.99', image: 'https://i.pravatar.cc/300?img=3',
        category: 'Lighting', rating: 4.4, reviewCount: 1890, isBestSeller: false,
        affiliateUrl: 'https://amzn.to/example3',
    },
    {
        id: 's4', name: 'JOBY GorillaPod 3K', description: 'Flexible mini tripod for any surface',
        price: '$29.99', image: 'https://i.pravatar.cc/300?img=4',
        category: 'Tripods', rating: 4.6, reviewCount: 3450, isBestSeller: false,
        affiliateUrl: 'https://amzn.to/example4',
    },
    {
        id: 's5', name: 'DaVinci Resolve Studio', description: 'Professional video editing software',
        price: '$295.00', image: 'https://i.pravatar.cc/300?img=5',
        category: 'Editing Tools', rating: 4.8, reviewCount: 890, isBestSeller: true,
        affiliateUrl: 'https://amzn.to/example5',
    },
    {
        id: 's6', name: 'Creator Starter Kit', description: 'Mic + Light + Tripod bundle for beginners',
        price: '$149.99', originalPrice: '$199.99', image: 'https://i.pravatar.cc/300?img=6',
        category: 'Starter Kits', rating: 4.9, reviewCount: 670, isBestSeller: true,
        affiliateUrl: 'https://amzn.to/example6',
    },
];

// ─── Leaderboard ───────────────────────────────────────────────────────────
export const MOCK_LEADERBOARD: LeaderboardEntry[] = MOCK_CREATORS.map((creator, i) => ({
    rank: i + 1,
    creator,
    metric: creator.totalVotes,
    change: [2, -1, 1, 3, 0, -2][i] ?? 0,
}));

// ─── Dashboard Stats ───────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
    totalVotes: 1845,
    totalViews: 28400,
    currentRank: 1,
    videosUploaded: 12,
    weeklyGrowth: [120, 180, 250, 310, 390, 420, 510],
    weeklyLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
