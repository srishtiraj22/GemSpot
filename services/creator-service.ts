/**
 * Creator Service — Get/create creators, claiming, invites (JS SDK)
 */

import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from 'firebase/firestore';
import { Share } from 'react-native';

export interface CreatorData {
    id: string;
    channelId: string;
    channelUrl: string;
    name: string;
    avatar: string;
    subscriberCount: number;
    claimed: boolean;
    userId: string | null;
    totalVotes: number;
    totalViews: number;
    rank: number;
    growthPercent: number;
    videosCount: number;
    isVerified: boolean;
    joinedAt: string;
}

/**
 * Get existing creator by channelId, or create an UNCLAIMED one
 */
export async function getOrCreateCreator(
    channelId: string,
    channelData: {
        channelUrl: string;
        name: string;
        avatar: string;
        subscriberCount: number;
    },
): Promise<CreatorData> {
    const q = query(collection(db, 'creators'), where('channelId', '==', channelId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const existing = snapshot.docs[0];
        return { ...existing.data(), id: existing.id } as CreatorData;
    }

    const urlQuery = query(collection(db, 'creators'), where('channelUrl', '==', channelData.channelUrl));
    const urlSnap = await getDocs(urlQuery);

    if (!urlSnap.empty) {
        const existing = urlSnap.docs[0];
        return { ...existing.data(), id: existing.id } as CreatorData;
    }

    // Creator doesn't exist — create UNCLAIMED profile
    const creatorRef = doc(collection(db, 'creators'));
    const newCreator: any = {
        id: creatorRef.id,
        channelId,
        channelUrl: channelData.channelUrl,
        name: channelData.name,
        avatar: channelData.avatar,
        subscriberCount: channelData.subscriberCount,
        claimed: false,
        userId: null,
        totalVotes: 0,
        totalViews: 0,
        rank: 0,
        growthPercent: 0,
        videosCount: 0,
        isVerified: false,
        joinedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
    };

    await setDoc(creatorRef, newCreator);
    return newCreator as CreatorData;
}

/**
 * Get a single creator by ID
 */
export async function getCreatorById(creatorId: string): Promise<CreatorData | null> {
    const snap = await getDoc(doc(db, 'creators', creatorId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as CreatorData;
}

/**
 * Get top creators for leaderboard
 */
export async function getTopCreators(sortBy: 'totalVotes' | 'growthPercent' = 'totalVotes', max: number = 20): Promise<CreatorData[]> {
    const q = query(
        collection(db, 'creators'),
        orderBy(sortBy, 'desc'),
        limit(max)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any, i: number) => ({
        ...d.data(),
        id: d.id,
        rank: i + 1,
    })) as CreatorData[];
}

/**
 * Invite an unclaimed creator — opens share sheet
 */
export async function inviteCreator(creatorName: string): Promise<void> {
    const message = `Hey ${creatorName}! 🎉\n\nYour videos are getting attention on GemSpots — a platform that helps small YouTube creators grow through community upvoting and discovery.\n\nJoin GemSpots to claim your profile and unlock:\n✅ Analytics & growth tracking\n✅ Brand deal opportunities\n✅ Verified creator badge\n\nDownload GemSpots: https://gemspots.app/invite\n\nYour fans are waiting! 💎`;

    try {
        await Share.share({ message, title: `Invite ${creatorName} to GemSpots` });
    } catch (error) {
        console.error('Share failed:', error);
    }
}

/**
 * Get videos by a specific creator
 */
export async function getCreatorVideos(creatorId: string): Promise<any[]> {
    const q = query(
        collection(db, 'videos'),
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => ({ ...d.data(), id: d.id }));
}
