/**
 * Video Service — Submit, query, and vote on videos (JS SDK)
 */

import type { Category, SortOption, SubscriberRange, Video } from '@/constants/types';
import {
    arrayRemove,
    arrayUnion,
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
import { getOrCreateCreator } from './creator-service';
import { incrementCreatorStat } from './creator-stats-service';
import { db } from './firebase';
import { fetchVideoInfo, isEligible } from './youtube-service';

export interface SubmitVideoInput {
    youtubeUrl: string;
    category: Category;
    description: string;
    submittedBy: string;
    mode: 'creator' | 'gem';
    channelUrl?: string;
}

export interface SubmitResult {
    success: boolean;
    videoId?: string;
    creatorId?: string;
    creatorClaimed?: boolean;
    error?: string;
    subscriberCheck?: 'pass' | 'fail';
    duplicateCheck?: 'pass' | 'fail';
}

/**
 * Submit a video — handles YouTube extraction, creator auto-creation, eligibility checks
 */
export async function submitVideo(input: SubmitVideoInput): Promise<SubmitResult> {
    try {
        const videoInfo = await fetchVideoInfo(input.youtubeUrl);
        if (!videoInfo) {
            return { success: false, error: 'Invalid YouTube URL' };
        }

        if (!isEligible(videoInfo.subscriberCount)) {
            return { success: false, error: 'Creator has more than 50K subscribers', subscriberCheck: 'fail' };
        }

        const dupeQuery = query(
            collection(db, 'videos'),
            where('youtubeVideoId', '==', videoInfo.videoId)
        );
        const dupeSnap = await getDocs(dupeQuery);
        if (!dupeSnap.empty) {
            return { success: false, error: 'This video has already been submitted', duplicateCheck: 'fail' };
        }

        const creator = await getOrCreateCreator(
            videoInfo.channelId,
            {
                channelUrl: input.channelUrl || `https://youtube.com/channel/${videoInfo.channelId}`,
                name: videoInfo.channelName,
                avatar: videoInfo.channelAvatar,
                subscriberCount: videoInfo.subscriberCount,
            }
        );

        const videoRef = doc(collection(db, 'videos'));
        const videoDoc = {
            id: videoRef.id,
            youtubeVideoId: videoInfo.videoId,
            youtubeUrl: input.youtubeUrl,
            title: videoInfo.title || input.description,
            description: input.description,
            category: input.category,
            thumbnailUrl: videoInfo.thumbnailUrl,
            creatorId: creator.id,
            creatorName: creator.name,
            creatorAvatar: creator.avatar,
            subscriberCount: videoInfo.subscriberCount,
            voteCount: 0,
            voters: [],
            commentCount: 0,
            viewsFromPlatform: 0,
            ratings: { editing: 0, audio: 0, content: 0, average: 0 },
            submittedBy: input.submittedBy,
            submittedAt: new Date().toISOString(),
            isFeatured: false,
            isTrending: false,
            isGemOfDay: false,
            tags: [],
            createdAt: serverTimestamp(),
        };

        await setDoc(videoRef, videoDoc);

        await updateDoc(doc(db, 'creators', creator.id), {
            videosCount: increment(1),
        });

        // Increment user's posts count
        try {
            await updateDoc(doc(db, 'users', input.submittedBy), {
                posts: increment(1),
            });
        } catch (_) { /* user doc may not exist for anonymous */ }

        // Update aggregated creator stats
        await incrementCreatorStat(input.submittedBy, 'totalVideos', 1);

        return {
            success: true,
            videoId: videoRef.id,
            creatorId: creator.id,
            creatorClaimed: creator.claimed,
            subscriberCheck: 'pass',
            duplicateCheck: 'pass',
        };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to submit video' };
    }
}

/**
 * Vote on a video (toggle — one vote per user)
 */
export async function voteVideo(videoId: string, userId: string): Promise<{ success: boolean; newCount: number }> {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
        return { success: false, newCount: 0 };
    }

    const videoData = videoSnap.data();

    // Block self-upvotes — creators cannot vote on their own videos
    if (videoData?.submittedBy === userId) {
        return { success: false, newCount: videoData?.voteCount || 0 };
    }

    const voters: string[] = videoData?.voters || [];

    if (voters.includes(userId)) {
        await updateDoc(videoRef, {
            voteCount: increment(-1),
            voters: arrayRemove(userId),
        });
        if (videoData?.creatorId) {
            await updateDoc(doc(db, 'creators', videoData.creatorId), {
                totalVotes: increment(-1),
            });
        }
        // Update aggregated creator stats
        if (videoData?.submittedBy) {
            await incrementCreatorStat(videoData.submittedBy, 'totalLikes', -1);
        }
        return { success: true, newCount: (videoData?.voteCount || 1) - 1 };
    } else {
        await updateDoc(videoRef, {
            voteCount: increment(1),
            voters: arrayUnion(userId),
        });
        if (videoData?.creatorId) {
            await updateDoc(doc(db, 'creators', videoData.creatorId), {
                totalVotes: increment(1),
            });
        }
        // Update aggregated creator stats
        if (videoData?.submittedBy) {
            await incrementCreatorStat(videoData.submittedBy, 'totalLikes', 1);
        }
        return { success: true, newCount: (videoData?.voteCount || 0) + 1 };
    }
}

/**
 * Get videos with filtering and sorting
 */
export async function getVideos(options?: {
    category?: Category;
    sort?: SortOption;
    subscriberRange?: SubscriberRange;
    limitCount?: number;
    trendingOnly?: boolean;
    gemOfDayOnly?: boolean;
}): Promise<Video[]> {
    let q = query(collection(db, 'videos'));

    if (options?.category) {
        q = query(q, where('category', '==', options.category));
    }
    if (options?.trendingOnly) {
        q = query(q, where('isTrending', '==', true));
    }
    if (options?.gemOfDayOnly) {
        q = query(q, where('isGemOfDay', '==', true));
    }
    if (options?.sort === 'Most Votes') {
        q = query(q, orderBy('voteCount', 'desc'));
    } else {
        q = query(q, orderBy('createdAt', 'desc'));
    }
    if (options?.limitCount) {
        q = query(q, limit(options.limitCount));
    }

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];

    if (options?.subscriberRange) {
        const maxSubs: Record<string, number> = {
            'Under 100': 100, 'Under 500': 500, 'Under 1K': 1000, 'Under 50K': 50000,
        };
        const max = maxSubs[options.subscriberRange];
        results = results.filter((v) => v.subscriberCount < max);
    }

    return results;
}

/**
 * Get a single video by ID
 */
export async function getVideoById(videoId: string): Promise<Video | null> {
    const snap = await getDoc(doc(db, 'videos', videoId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as Video;
}

/**
 * Get all videos submitted by a specific user
 */
export async function getVideosByUser(userId: string): Promise<Video[]> {
    const q = query(
        collection(db, 'videos'),
        where('submittedBy', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Video[];
}

/**
 * Delete a video (only if submitted by the requesting user)
 */
export async function deleteVideo(videoId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const videoRef = doc(db, 'videos', videoId);
        const videoSnap = await getDoc(videoRef);

        if (!videoSnap.exists()) {
            return { success: false, error: 'Video not found' };
        }

        const videoData = videoSnap.data();
        if (videoData?.submittedBy !== userId) {
            return { success: false, error: 'You can only delete videos you submitted' };
        }

        // Decrease creator video count
        if (videoData?.creatorId) {
            try {
                await updateDoc(doc(db, 'creators', videoData.creatorId), {
                    videosCount: increment(-1),
                });
            } catch (_) { /* creator may not exist */ }
        }

        // Decrement aggregated creator stats
        if (videoData?.submittedBy) {
            await incrementCreatorStat(videoData.submittedBy, 'totalVideos', -1);
        }

        const { deleteDoc: firestoreDeleteDoc } = await import('firebase/firestore');
        await firestoreDeleteDoc(videoRef);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to delete video' };
    }
}

/**
 * Record a view on a video (increments viewsFromPlatform)
 */
export async function viewVideo(videoId: string): Promise<void> {
    try {
        const videoRef = doc(db, 'videos', videoId);
        await updateDoc(videoRef, {
            viewsFromPlatform: increment(1),
        });
        // Update aggregated creator stats
        const videoSnap = await getDoc(videoRef);
        if (videoSnap.exists() && videoSnap.data()?.submittedBy) {
            await incrementCreatorStat(videoSnap.data().submittedBy, 'totalViews', 1);
        }
    } catch (error) {
        console.log('Failed to record view:', error);
    }
}

