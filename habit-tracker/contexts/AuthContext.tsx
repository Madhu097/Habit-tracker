'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeToAuthChanges } from '@/lib/firebase/auth';

interface AuthContextType {
    user: FirebaseUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [minLoadingComplete, setMinLoadingComplete] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);

    useEffect(() => {
        // Ensure minimum loading time for smooth transition
        const minLoadingTimer = setTimeout(() => {
            setMinLoadingComplete(true);
        }, 500);

        const unsubscribe = subscribeToAuthChanges((user) => {
            setUser(user);
            setAuthInitialized(true);
        });

        return () => {
            clearTimeout(minLoadingTimer);
            unsubscribe();
        };
    }, []);

    // Update loading state when both minimum time and auth initialization are complete
    useEffect(() => {
        if (minLoadingComplete && authInitialized) {
            setLoading(false);
        }
    }, [minLoadingComplete, authInitialized]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
