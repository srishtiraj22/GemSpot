/**
 * Subscribe Service — Array-based subscriber system with batch writes
 * Replaces the old follow-service.ts (counter-based approach)
 *
 * Data model:
 *   users/{userId}.subscribers: string[]    — userIds who subscribe to this user
 *   users/{userId}.subscribedTo: string[]   — creatorIds this user subscribes to
 */

import {
    arrayRemove,
    arrayUnion,
    doc,
    getDoc,
    writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { incrementCreatorStat } from './creator-stats-service';

/**
 * Subscribe to a creator — atomic batch write on both user docs
 */
export async function subscribeToCreator(
    userId: string,
    creatorId: string,
): Promise<{ success: boolean; error?: string }> {
    if (userId === creatorId) {
        return { success: false, error: 'Cannot subscribe to yourself' };
    }

    try {
        // Check if already subscribed
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) {
            const data = userSnap.data();
            if ((data.subscribedTo || []).includes(creatorId)) {
                return { success: false, error: 'Already subscribed' };
            }
        }

        const batch = writeBatch(db);
        const userRef = doc(db, 'users', userId);
        const creatorRef = doc(db, 'users', creatorId);

        // Add creatorId to user's subscribedTo list
        batch.update(userRef, { subscribedTo: arrayUnion(creatorId) });

        // Add userId to creator's subscribers list
        batch.update(creatorRef, { subscribers: arrayUnion(userId) });

        await batch.commit();

        // Update aggregated creator stats
        await incrementCreatorStat(creatorId, 'subscribers', 1);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to subscribe' };
    }
}

/**
 * Unsubscribe from a creator — atomic batch write on both user docs
 */
export async function unsubscribeFromCreator(
    userId: string,
    creatorId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', userId);
        const creatorRef = doc(db, 'users', creatorId);

        // Remove creatorId from user's subscribedTo list
        batch.update(userRef, { subscribedTo: arrayRemove(creatorId) });

        // Remove userId from creator's subscribers list
        batch.update(creatorRef, { subscribers: arrayRemove(userId) });

        await batch.commit();

        // Update aggregated creator stats
        await incrementCreatorStat(creatorId, 'subscribers', -1);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to unsubscribe' };
    }
}

/**
 * Check if a user is subscribed to a creator
 */
export async function isSubscribed(userId: string, creatorId: string): Promise<boolean> {
    try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (!snap.exists()) return false;
        const data = snap.data();
        return (data.subscribedTo || []).includes(creatorId);
    } catch {
        return false;
    }
}

/**
 * Get subscriber count for a user (reads from the arrays)
 */
export async function getSubscriberCount(userId: string): Promise<number> {
    try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (!snap.exists()) return 0;
        return (snap.data().subscribers || []).length;
    } catch {
        return 0;
    }
}

/**
 * Get subscriptions count for a user
 */
export async function getSubscriptionsCount(userId: string): Promise<number> {
    try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (!snap.exists()) return 0;
        return (snap.data().subscribedTo || []).length;
    } catch {
        return 0;
    }
}
