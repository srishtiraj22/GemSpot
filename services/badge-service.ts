/**
 * Badge Service — Define, check, and award badges (JS SDK)
 * Badges are stored in the user's Firestore document.
 * No badges are pre-assigned; they unlock only when criteria are met.
 */

import type { Badge } from '@/constants/types';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './firebase';

/* ─── Badge Definitions ────────────────────────────────────────────────── */

export interface BadgeDefinition {
    id: string;
    name: string;
    icon: string;
    description: string;
    /** Returns true if the user meets the criteria */
    check: (stats: UserStats) => boolean;
}

export interface UserStats {
    totalSubmissions: number;
    totalVotesGiven: number;
    streak: number;
    followers: number;
    totalVotesReceived: number;  // on the user's submitted videos
    rank: number; // 0 = unranked
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    {
        id: 'b1',
        name: 'Gem Hunter',
        icon: '💎',
        description: 'Submitted 10 hidden gems.',
        check: (s) => s.totalSubmissions >= 10,
    },
    {
        id: 'b2',
        name: 'Rising Scout',
        icon: '🔭',
        description: 'Upvoted 50 videos.',
        check: (s) => s.totalVotesGiven >= 50,
    },
    {
        id: 'b3',
        name: 'Streak Master',
        icon: '🔥',
        description: 'Achieved a 7-day voting streak.',
        check: (s) => s.streak >= 7,
    },
    {
        id: 'b4',
        name: 'Trendsetter',
        icon: '📈',
        description: 'One of your videos received 100+ upvotes.',
        check: (s) => s.totalVotesReceived >= 100,
    },
    {
        id: 'b7',
        name: 'Content King',
        icon: '👑',
        description: 'Reached #1 on the leaderboard.',
        check: (s) => s.rank === 1,
    },
    {
        id: 'b5',
        name: 'Community Builder',
        icon: '🤝',
        description: 'Gained 25 followers.',
        check: (s) => s.followers >= 25,
    },
    {
        id: 'b6',
        name: 'First Steps',
        icon: '🌱',
        description: 'Submitted your first video.',
        check: (s) => s.totalSubmissions >= 1,
    },
];

/* ─── Functions ────────────────────────────────────────────────────────── */

/**
 * Get the current user's earned badges from Firestore.
 */
export async function getUserBadges(userId: string): Promise<Badge[]> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return [];
    const data = snap.data();
    return (data.badges || []) as Badge[];
}

/**
 * Gather stats needed for badge evaluation.
 */
export async function gatherUserStats(userId: string): Promise<UserStats> {
    // Total submissions
    const videosQuery = query(
        collection(db, 'videos'),
        where('submittedBy', '==', userId)
    );
    const videosSnap = await getDocs(videosQuery);
    const totalSubmissions = videosSnap.size;

    // Total votes received on user's videos
    let totalVotesReceived = 0;
    videosSnap.docs.forEach((d) => {
        totalVotesReceived += d.data().voteCount || 0;
    });

    // User data
    const userSnap = await getDoc(doc(db, 'users', userId));
    const userData = userSnap.exists() ? userSnap.data() : {} as any;

    // Count total votes given (count videos where user is in voters array is expensive;
    // instead we use votesToday accumulation — we'll track lifetime votes in user doc)
    const totalVotesGiven = userData.lifetimeVotes || 0;

    // Rank
    const rank = userData.rank || 0;

    return {
        totalSubmissions,
        totalVotesGiven,
        streak: userData.streak || 0,
        followers: userData.followers || 0,
        totalVotesReceived,
        rank,
    };
}

/**
 * Check all badge criteria and award any newly earned badges.
 * Returns newly earned badges (if any).
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const [currentBadges, stats] = await Promise.all([
        getUserBadges(userId),
        gatherUserStats(userId),
    ]);

    const earnedIds = new Set(currentBadges.map((b) => b.id));
    const newlyEarned: Badge[] = [];

    for (const def of BADGE_DEFINITIONS) {
        if (!earnedIds.has(def.id) && def.check(stats)) {
            newlyEarned.push({
                id: def.id,
                name: def.name,
                icon: def.icon,
                description: def.description,
                earnedAt: new Date().toISOString(),
                isLocked: false,
            });
        }
    }

    if (newlyEarned.length > 0) {
        const allBadges = [...currentBadges, ...newlyEarned];
        await updateDoc(doc(db, 'users', userId), {
            badges: allBadges,
        });
    }

    return newlyEarned;
}

/**
 * Get all badge definitions with earned/locked status for a user.
 */
export async function getAllBadgesForUser(userId: string): Promise<Badge[]> {
    const earned = await getUserBadges(userId);
    const earnedIds = new Set(earned.map((b) => b.id));

    return BADGE_DEFINITIONS.map((def) => {
        const earnedBadge = earned.find((b) => b.id === def.id);
        if (earnedBadge) {
            return earnedBadge;
        }
        return {
            id: def.id,
            name: def.name,
            icon: def.icon,
            description: def.description,
            isLocked: true,
        };
    });
}
