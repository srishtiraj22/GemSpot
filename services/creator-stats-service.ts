/**
 * Creator Stats Service — Aggregated statistics for creator dashboards
 * Uses a dedicated `creatorStats/{userId}` Firestore doc to avoid recalculating on every load.
 */

import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';

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

const DEFAULT_STATS: CreatorStats = {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalVideos: 0,
    subscribers: 0,
    bestVideoId: '',
    bestVideoTitle: '',
    lastUpdated: null,
};

/**
 * Get or create the aggregated stats document for a creator
 */
export async function getCreatorStats(userId: string): Promise<CreatorStats> {
    const ref = doc(db, 'creatorStats', userId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        return snap.data() as CreatorStats;
    }

    // Create default stats doc if it doesn't exist
    await setDoc(ref, { ...DEFAULT_STATS, lastUpdated: serverTimestamp() });
    return { ...DEFAULT_STATS };
}

/**
 * Atomically increment a stat field
 */
export async function incrementCreatorStat(
    userId: string,
    field: keyof Pick<CreatorStats, 'totalViews' | 'totalLikes' | 'totalComments' | 'totalVideos' | 'subscribers'>,
    amount: number = 1,
): Promise<void> {
    const ref = doc(db, 'creatorStats', userId);

    try {
        await updateDoc(ref, {
            [field]: increment(amount),
            lastUpdated: serverTimestamp(),
        });
    } catch {
        // Doc may not exist yet — create it with default values + this increment
        const defaults = { ...DEFAULT_STATS, [field]: amount, lastUpdated: serverTimestamp() };
        await setDoc(ref, defaults);
    }
}

/**
 * Update the best performing video
 */
export async function updateBestVideo(
    userId: string,
    videoId: string,
    videoTitle: string,
): Promise<void> {
    const ref = doc(db, 'creatorStats', userId);
    try {
        await updateDoc(ref, {
            bestVideoId: videoId,
            bestVideoTitle: videoTitle,
            lastUpdated: serverTimestamp(),
        });
    } catch {
        // Ignore if doc doesn't exist
    }
}

/**
 * Get recent comments across all of a creator's videos
 */
export async function getRecentCommentsForCreator(
    userId: string,
    maxCount: number = 20,
): Promise<any[]> {
    try {
        // First get all video IDs by this creator
        const videosQ = query(
            collection(db, 'videos'),
            where('submittedBy', '==', userId),
            orderBy('createdAt', 'desc'),
        );
        const videosSnap = await getDocs(videosQ);
        const videoIds = videosSnap.docs.map((d) => d.id);

        if (videoIds.length === 0) return [];

        // Fetch comments from each video's subcollection
        const allComments: any[] = [];
        for (const videoId of videoIds.slice(0, 10)) {
            const commentsQ = query(
                collection(db, 'videos', videoId, 'comments'),
                orderBy('createdAtServer', 'desc'),
                limit(5),
            );
            const commentsSnap = await getDocs(commentsQ);
            const videoData = videosSnap.docs.find((d) => d.id === videoId)?.data();
            commentsSnap.docs.forEach((d) => {
                allComments.push({
                    ...d.data(),
                    id: d.id,
                    videoId,
                    videoTitle: videoData?.title || 'Unknown Video',
                });
            });
        }

        // Sort by createdAt descending and limit
        allComments.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return allComments.slice(0, maxCount);
    } catch (error) {
        console.log('Failed to fetch creator comments:', error);
        return [];
    }
}

/**
 * Get list of subscribers (users who subscribed to this creator)
 * Reads from the creator's `subscribers` array field
 */
export async function getSubscribersList(
    userId: string,
    maxCount: number = 50,
): Promise<any[]> {
    try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (!userSnap.exists()) return [];

        const subscriberIds: string[] = (userSnap.data().subscribers || []).slice(0, maxCount);
        if (subscriberIds.length === 0) return [];

        const subscribers: any[] = [];
        for (const subId of subscriberIds) {
            const subSnap = await getDoc(doc(db, 'users', subId));
            if (subSnap.exists()) {
                const subData = subSnap.data();
                subscribers.push({
                    id: subId,
                    name: subData.name || 'Unknown',
                    avatar: subData.avatar || '',
                    joinedAt: subData.joinedAt || '',
                });
            }
        }

        return subscribers;
    } catch (error) {
        console.log('Failed to fetch subscribers:', error);
        return [];
    }
}

/**
 * Initialize creatorStats for a user if it doesn't exist
 */
export async function ensureCreatorStats(userId: string): Promise<void> {
    const ref = doc(db, 'creatorStats', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, { ...DEFAULT_STATS, lastUpdated: serverTimestamp() });
    }
}
