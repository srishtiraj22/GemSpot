/**
 * Auth Service — Firebase Authentication (JS SDK)
 */

import type { User } from '@/constants/types';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Sign up a new user
 */
export async function signUp(
    email: string,
    password: string,
    name: string,
    role: 'viewer' | 'creator' | 'brand',
    channelUrl?: string,
): Promise<User> {
    // 1. Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // 2. Create Firestore user document
    const userDoc: any = {
        id: cred.user.uid,
        name,
        email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff&size=128`,
        role,
        streak: 0,
        badges: [],
        votesToday: 0,
        maxVotesPerDay: 10,
        joinedAt: new Date().toISOString(),
        subscribers: [],
        subscribedTo: [],
        posts: 0,
        lifetimeVotes: 0,
        createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), userDoc);

    // 3. If creator, try to claim existing unclaimed profile
    if (role === 'creator' && channelUrl) {
        await claimCreatorProfile(cred.user.uid, name, channelUrl);
    }

    return { ...userDoc, badges: [] } as User;
}

/**
 * Sign in existing user
 */
export async function signIn(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    const userSnap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!userSnap.exists()) {
        throw new Error('User profile not found');
    }

    return { ...userSnap.data(), id: cred.user.uid } as User;
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
    await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Claim an unclaimed creator profile or create a new claimed one
 */
export async function claimCreatorProfile(
    userId: string,
    name: string,
    channelUrl: string,
): Promise<void> {
    const creatorsRef = collection(db, 'creators');
    const q = query(creatorsRef, where('channelUrl', '==', channelUrl), where('claimed', '==', false));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'creators', existingDoc.id), {
            claimed: true,
            userId,
            claimedAt: serverTimestamp(),
        });
    } else {
        const newCreatorRef = doc(collection(db, 'creators'));
        await setDoc(newCreatorRef, {
            id: newCreatorRef.id,
            channelId: '',
            channelUrl,
            name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10B981&color=fff&size=128`,
            subscriberCount: 0,
            claimed: true,
            userId,
            totalVotes: 0,
            totalViews: 0,
            rank: 0,
            growthPercent: 0,
            videosCount: 0,
            isVerified: false,
            joinedAt: new Date().toISOString(),
            createdAt: serverTimestamp(),
        });
    }
}

/**
 * Get current user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: userId } as User;
}
