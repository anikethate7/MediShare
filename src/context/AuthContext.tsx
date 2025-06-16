
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuth, db as firebaseDb, firebaseInitError } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { NGO } from '@/types';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface AuthContextType {
  currentUser: User | null;
  ngoProfile: NGO | null;
  loading: boolean;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean; // Add this to indicate Firebase status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ngoProfile, setNgoProfile] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(!firebaseInitError && !!firebaseAuth);
  const { toast } = useToast();

  useEffect(() => {
    if (firebaseInitError) {
      console.error("AuthContext: Firebase initialization failed.", firebaseInitError.message);
      // Optionally notify user, but primary notification will be on login/register attempts
      // toast({
      //   variant: "destructive",
      //   title: "Firebase Configuration Error",
      //   description: "Firebase is not configured correctly. Authentication and database features will be unavailable. Please check console for details.",
      //   duration: 10000,
      // });
      setIsFirebaseConfigured(false);
      setLoading(false);
      return;
    }
    
    if (!firebaseAuth) {
      console.error("AuthContext: Firebase Auth instance is not available even after successful init check. This is unexpected.");
      setIsFirebaseConfigured(false);
      setLoading(false);
      return;
    }

    setIsFirebaseConfigured(true);
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setCurrentUser(user);
      if (user && firebaseDb) {
        const ngoDocRef = doc(firebaseDb, 'ngos', user.uid);
        try {
          const ngoDocSnap = await getDoc(ngoDocRef);
          if (ngoDocSnap.exists()) {
            setNgoProfile({ uid: user.uid, ...ngoDocSnap.data() } as NGO);
          } else {
            setNgoProfile(null);
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

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

  const value = {
    currentUser,
    ngoProfile,
    loading,
    logout,
    isFirebaseConfigured,
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
