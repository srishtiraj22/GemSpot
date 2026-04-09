/**
 * Comment Service — Add and fetch comments (JS SDK)
 */

import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs,
    updateDoc,
    increment,
    query,
    orderBy,
    serverTimestamp,
} from 'firebase/firestore';
import type { Comment } from '@/constants/types';
import { incrementCreatorStat } from './creator-stats-service';

/**
 * Add a comment to a video
 */
export async function addComment(
    videoId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    text: string,
): Promise<Comment> {
    const commentRef = doc(collection(db, 'videos', videoId, 'comments'));
    const comment: any = {
        id: commentRef.id,
        userId,
        userName,
        userAvatar,
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
        createdAtServer: serverTimestamp(),
    };

    await setDoc(commentRef, comment);

    await updateDoc(doc(db, 'videos', videoId), {
        commentCount: increment(1),
    });

    // Update aggregated creator stats
    try {
        const videoSnap = await getDoc(doc(db, 'videos', videoId));
        if (videoSnap.exists() && videoSnap.data()?.submittedBy) {
            await incrementCreatorStat(videoSnap.data().submittedBy, 'totalComments', 1);
        }
    } catch (_) { /* ignore */ }

    return comment as Comment;
}

/**
 * Get all comments for a video
 */
export async function getComments(videoId: string): Promise<Comment[]> {
    const q = query(
        collection(db, 'videos', videoId, 'comments'),
        orderBy('createdAtServer', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d: any) => ({ ...d.data(), id: d.id })) as Comment[];
}

/**
 * Like a comment
 */
export async function likeComment(videoId: string, commentId: string): Promise<void> {
    await updateDoc(doc(db, 'videos', videoId, 'comments', commentId), {
        likes: increment(1),
    });
}
