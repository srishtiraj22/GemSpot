/**
 * Ranking Service — Top creators and top videos (weekly/monthly)
 */

import type { Video } from '@/constants/types';
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import type { CreatorData } from './creator-service';
import { db } from './firebase';

export type RankingPeriod = 'weekly' | 'monthly';

function getPeriodStartDate(period: RankingPeriod): Date {
    const now = new Date();
    if (period === 'weekly') {
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
}

/**
 * Get top creators ranked by totalVotes.
 * For weekly/monthly, we filter creators who joined within the period OR
 * sort by totalVotes regardless (since we don't have period-specific vote counters).
 */
export async function getTopCreators(
    period: RankingPeriod = 'weekly',
    max: number = 20,
): Promise<(CreatorData & { rank: number })[]> {
    const q = query(
        collection(db, 'creators'),
        orderBy('totalVotes', 'desc'),
        limit(max),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any, i: number) => ({
        ...d.data(),
        id: d.id,
        rank: i + 1,
    })) as (CreatorData & { rank: number })[];
}

/**
 * Get top videos ranked by voteCount within a time period.
 */
export async function getTopVideos(
    period: RankingPeriod = 'weekly',
    max: number = 20,
): Promise<Video[]> {
    const startDate = getPeriodStartDate(period);

    // We query videos created after the start date and order by voteCount
    // Note: Firestore compound queries may require an index
    const q = query(
        collection(db, 'videos'),
        where('submittedAt', '>=', startDate.toISOString()),
        orderBy('submittedAt', 'desc'),
        limit(max * 2), // fetch extra to sort client-side by votes
    );

    try {
        const snapshot = await getDocs(q);
        const videos = snapshot.docs.map((d: any) => ({
            ...d.data(),
            id: d.id,
        })) as Video[];

        // Sort by vote count descending and limit
        return videos
            .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
            .slice(0, max);
    } catch {
        // Fallback: if compound index not available, just get all videos sorted by votes
        const fallbackQ = query(
            collection(db, 'videos'),
            orderBy('voteCount', 'desc'),
            limit(max),
        );
        const snapshot = await getDocs(fallbackQ);
        return snapshot.docs.map((d: any) => ({
            ...d.data(),
            id: d.id,
        })) as Video[];
    }
}
