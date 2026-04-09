/**
 * User Service — Profile, streak management (JS SDK)
 * Streak uses IST (UTC+5:30) for date comparison
 */

import type { User } from '@/constants/types';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: userId } as User;
}

/**
 * Get current IST date as YYYY-MM-DD string
 */
function getISTDateString(date: Date = new Date()): string {
    // IST = UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Calculate day difference between two YYYY-MM-DD date strings
 */
function daysDiff(dateA: string, dateB: string): number {
    const a = new Date(dateA + 'T00:00:00Z');
    const b = new Date(dateB + 'T00:00:00Z');
    return Math.round(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Update daily streak — IST-based date comparison
 * Same day → no change; next day → +1; missed 1+ day → reset to 1
 */
export async function updateStreak(userId: string): Promise<number> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return 0;

    const user = snap.data() as any;
    const todayIST = getISTDateString();
    const lastActiveIST = user.lastActiveDate || null;

    let newStreak = user.streak || 0;

    if (lastActiveIST) {
        // Compare date portions only
        const lastDate = lastActiveIST.split('T')[0]; // handles both ISO and YYYY-MM-DD
        const diff = daysDiff(todayIST, lastDate);

        if (diff === 0) {
            // Same IST day — streak stays the same, just reset votes if needed
        } else if (diff === 1) {
            // Consecutive day — increment streak
            newStreak += 1;
        } else {
            // Missed 1+ days — reset streak
            newStreak = 1;
        }
    } else {
        // First time login
        newStreak = 1;
    }

    const isSameDay = lastActiveIST && lastActiveIST.split('T')[0] === todayIST;

    await updateDoc(userRef, {
        streak: newStreak,
        lastActiveDate: todayIST,
        votesToday: isSameDay ? user.votesToday : 0,
    });

    return newStreak;
}

/**
 * Increment vote count for today
 */
export async function incrementVoteCount(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { allowed: false, remaining: 0 };

    const user = snap.data() as User;

    if (user.votesToday >= user.maxVotesPerDay) {
        return { allowed: false, remaining: 0 };
    }

    await updateDoc(userRef, {
        votesToday: increment(1),
        lifetimeVotes: increment(1),
    });

    return { allowed: true, remaining: user.maxVotesPerDay - user.votesToday - 1 };
}

/**
 * Get rank of a user by subscriber count
 */
export async function getUserRank(userId: string): Promise<number> {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(query(usersRef));

    // Sort by subscribers array length (descending)
    const sorted = snap.docs
        .map((d) => ({ id: d.id, subsCount: (d.data().subscribers || []).length }))
        .sort((a, b) => b.subsCount - a.subsCount);

    const rank = sorted.findIndex((u) => u.id === userId);
    return rank >= 0 ? rank + 1 : -1;
}
