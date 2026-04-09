/**
 * Auth Context — Provides auth state and methods across the app (JS SDK)
 */

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import * as AuthService from '@/services/auth-service';
import * as UserService from '@/services/user-service';
import type { User } from '@/constants/types';

interface AuthContextType {
    user: User | null;
    firebaseUser: any | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string, role: 'viewer' | 'creator' | 'brand', channelUrl?: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isAuthenticated: false,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
    refreshUser: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                const profile = await AuthService.getUserProfile(fbUser.uid);
                setUser(profile);
                if (profile) {
                    await UserService.updateStreak(fbUser.uid);
                }
            } else {
                setUser(null);
            }

            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleSignIn = async (email: string, password: string) => {
        const profile = await AuthService.signIn(email, password);
        setUser(profile);
    };

    const handleSignUp = async (
        email: string,
        password: string,
        name: string,
        role: 'viewer' | 'creator' | 'brand',
        channelUrl?: string,
    ) => {
        const profile = await AuthService.signUp(email, password, name, role, channelUrl);
        setUser(profile);
    };

    const handleSignOut = async () => {
        await AuthService.signOut();
        setUser(null);
    };

    const refreshUser = async () => {
        if (firebaseUser) {
            const profile = await AuthService.getUserProfile(firebaseUser.uid);
            setUser(profile);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                isLoading,
                isAuthenticated: !!user,
                signIn: handleSignIn,
                signUp: handleSignUp,
                signOut: handleSignOut,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
