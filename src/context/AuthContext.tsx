
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuth, db as firebaseDb, firebaseInitError } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { NGO } from '@/types';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'donor' | 'ngo' | null;

interface AuthContextType {
  currentUser: User | null;
  ngoProfile: NGO | null;
  userRole: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean;
  refreshNgoProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ngoProfile, setNgoProfile] = useState<NGO | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(!firebaseInitError && !!firebaseAuth);
  const { toast } = useToast();

  const fetchNgoProfileAndSetRole = useCallback(async (user: User | null) => {
    if (user && firebaseDb) {
      const ngoDocRef = doc(firebaseDb, 'ngos', user.uid);
      try {
        const ngoDocSnap = await getDoc(ngoDocRef);
        if (ngoDocSnap.exists()) {
          setNgoProfile({ uid: user.uid, ...ngoDocSnap.data() } as NGO);
          setUserRole('ngo');
        } else {
          setNgoProfile(null);
          // If NGO profile doesn't exist, but user is logged in, assume 'donor' for now.
          // A more robust system would check a 'users' collection for a specific role.
          setUserRole('donor'); 
          console.warn("NGO profile not found for user:", user.uid, "Assigning 'donor' role.");
        }
      } catch (error) {
          console.error("Error fetching NGO profile:", error);
          setNgoProfile(null);
          setUserRole(null); // Or 'donor' if we want to be lenient on profile fetch error
           toast({
              variant: 'destructive',
              title: 'Profile Error',
              description: 'Could not fetch user profile information.',
          });
      }
    } else {
      setNgoProfile(null);
      setUserRole(null);
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
      await fetchNgoProfileAndSetRole(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchNgoProfileAndSetRole]);

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
      // State updates (currentUser, ngoProfile, userRole to null) will be handled by onAuthStateChanged
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
    // This function primarily refreshes NGO profile, role is set as part of this.
    if (currentUser) {
        setLoading(true);
        await fetchNgoProfileAndSetRole(currentUser);
        setLoading(false);
    }
  }, [currentUser, fetchNgoProfileAndSetRole]);


  const value = {
    currentUser,
    ngoProfile,
    userRole,
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
