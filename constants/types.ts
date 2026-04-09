/**
 * GemSpots — TypeScript Interfaces
 * Updated for Phase 2: claimed/unclaimed creators, Firestore fields
 */

export interface Video {
    id: string;
    youtubeVideoId: string;
    youtubeUrl?: string;
    title: string;
    description: string;
    category: Category;
    thumbnailUrl: string;
    creatorId: string;
    creatorName: string;
    creatorAvatar: string;
    subscriberCount: number;
    voteCount: number;
    voters: string[];          // userIds who voted
    commentCount: number;
    viewsFromPlatform: number;
    ratings: VideoRatings;
    submittedBy: string;       // userId who submitted
    submittedAt: string;       // ISO date
    isFeatured: boolean;
    isTrending: boolean;
    isGemOfDay: boolean;
    tags: string[];
}

export interface VideoRatings {
    editing: number;   // 1-5
    audio: number;     // 1-5
    content: number;   // 1-5
    average: number;
}

export interface Creator {
    id: string;
    channelId: string;         // YouTube channel ID
    channelUrl: string;        // Full YouTube URL
    name: string;
    avatar: string;
    subscriberCount: number;
    claimed: boolean;          // true = has account, false = auto-created
    userId: string | null;     // null for unclaimed creators
    totalVotes: number;
    totalViews: number;
    rank: number;
    growthPercent: number;     // weekly growth %
    isVerified: boolean;
    joinedAt: string;
    videosCount: number;
    badges?: Badge[];
    level?: number;
    xp?: number;
    xpToNext?: number;
}

export interface Brand {
    id: string;
    name: string;
    logo: string;
    description: string;
    website: string;
    campaigns: Campaign[];
}

export interface Campaign {
    id: string;
    brandId: string;
    brandName: string;
    brandLogo: string;
    title: string;
    description: string;
    budget: string;
    category: Category;
    requirements: string[];
    deadline: string;
    applicantsCount: number;
    maxCreators: number;
    status: 'active' | 'applied' | 'closed' | 'completed';
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'viewer' | 'creator' | 'brand';
    streak: number;
    badges: Badge[];
    votesToday: number;
    maxVotesPerDay: number;
    joinedAt: string;
    subscribers: string[];    // userIds who subscribe to this user
    subscribedTo: string[];   // creatorIds this user subscribes to
    posts: number;
    lastActiveDate?: string;
    bio?: string;
    profileCategory?: Category;
}

export interface CreatorStats {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalVideos: number;
    subscribers: number;
    bestVideoId: string;
    bestVideoTitle: string;
    lastUpdated: any;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: string;
    likes: number;
}

export interface Badge {
    id: string;
    name: string;
    icon: string;   // emoji
    description: string;
    earnedAt?: string;
    isLocked: boolean;
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: string;
    originalPrice?: string;
    image: string;
    category: ShopCategory;
    rating: number;
    reviewCount: number;
    isBestSeller: boolean;
    affiliateUrl: string;
}

export interface LeaderboardEntry {
    rank: number;
    creator: Creator;
    metric: number;
    change: number;
}

export type Category =
    | 'Gaming'
    | 'Tech'
    | 'Comedy'
    | 'Music'
    | 'Education'
    | 'Vlogs'
    | 'Cooking'
    | 'Fitness'
    | 'Art'
    | 'Science'
    | 'Travel'
    | 'Other';

export type ShopCategory =
    | 'Microphones'
    | 'Cameras'
    | 'Lighting'
    | 'Tripods'
    | 'Editing Tools'
    | 'Starter Kits';

export type SubscriberRange = 'Under 100' | 'Under 500' | 'Under 1K' | 'Under 50K';

export type SortOption = 'Most Votes' | 'Newest' | 'Trending';

export const CATEGORIES: { name: Category; emoji: string }[] = [
    { name: 'Gaming', emoji: '🎮' },
    { name: 'Tech', emoji: '💻' },
    { name: 'Comedy', emoji: '😂' },
    { name: 'Music', emoji: '🎵' },
    { name: 'Education', emoji: '📚' },
    { name: 'Vlogs', emoji: '📹' },
    { name: 'Cooking', emoji: '🍳' },
    { name: 'Fitness', emoji: '💪' },
    { name: 'Art', emoji: '🎨' },
    { name: 'Science', emoji: '🔬' },
    { name: 'Travel', emoji: '✈️' },
    { name: 'Other', emoji: '📌' },
];

export const SUBSCRIBER_RANGES: SubscriberRange[] = [
    'Under 100',
    'Under 500',
    'Under 1K',
    'Under 50K',
];
