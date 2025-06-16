
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuth, db as firebaseDb, firebaseInitError } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { NGO } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  ngoProfile: NGO | null;
  loading: boolean;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean;
  refreshNgoProfile: () => Promise<void>; // Added this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ngoProfile, setNgoProfile] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(!firebaseInitError && !!firebaseAuth);
  const { toast } = useToast();

  const fetchNgoProfile = useCallback(async (user: User | null) => {
    if (user && firebaseDb) {
      const ngoDocRef = doc(firebaseDb, 'ngos', user.uid);
      try {
        const ngoDocSnap = await getDoc(ngoDocRef);
        if (ngoDocSnap.exists()) {
          setNgoProfile({ uid: user.uid, ...ngoDocSnap.data() } as NGO);
        } else {
          setNgoProfile(null);
          // console.warn("NGO profile not found for user:", user.uid);
        }
      } catch (error) {
          console.error("Error fetching NGO profile:", error);
          setNgoProfile(null);
           toast({
              variant: 'destructive',
              title: 'Profile Error',
              description: 'Could not fetch NGO profile.',
          });
      }
    } else {
      setNgoProfile(null);
    }
  }, [toast]);


  useEffect(() => {
    if (firebaseInitError) {
      console.error("AuthContext: Firebase initialization failed.", firebaseInitError.message);
      setIsFirebaseConfigured(false);
      setLoading(false);
      return;
    }
    
    if (!firebaseAuth) {
      console.error("AuthContext: Firebase Auth instance is not available.");
      setIsFirebaseConfigured(false);
      setLoading(false);
      return;
    }

    setIsFirebaseConfigured(true);
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setCurrentUser(user);
      await fetchNgoProfile(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast, fetchNgoProfile]);

  const logout = async () => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      console.error("Cannot logout, Firebase not configured correctly.");
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Firebase is not configured. Please check setup.",
      });
      return;
    }
    try {
      await firebaseSignOut(firebaseAuth);
      // State updates (currentUser, ngoProfile to null) will be handled by onAuthStateChanged
    } catch (error: any) {
        console.error("Error during logout:", error);
        toast({
            variant: "destructive",
            title: "Logout Error",
            description: error.message || "Failed to logout. Please try again.",
        });
    }
  };

  const refreshNgoProfile = useCallback(async () => {
    if (currentUser) {
        setLoading(true);
        await fetchNgoProfile(currentUser);
        setLoading(false);
    }
  }, [currentUser, fetchNgoProfile]);


  const value = {
    currentUser,
    ngoProfile,
    loading,
    logout,
    isFirebaseConfigured,
    refreshNgoProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
