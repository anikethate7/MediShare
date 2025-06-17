
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth as firebaseAuth, db as firebaseDb, firebaseInitError } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { NGO, Donor } from '@/types';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'donor' | 'ngo' | null;

interface AuthContextType {
  currentUser: User | null;
  ngoProfile: NGO | null;
  donorProfile: Donor | null;
  userRole: UserRole;
  loading: boolean; // True while checking auth state OR fetching profile
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ngoProfile, setNgoProfile] = useState<NGO | null>(null);
  const [donorProfile, setDonorProfile] = useState<Donor | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true); // Initialize to true
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(!firebaseInitError && !!firebaseAuth);
  const { toast } = useToast();

  // Effect for handling Firebase auth state changes
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
    setLoading(true); // Set loading true when starting to listen for auth state
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      // Profile fetching and role setting will be handled by the next useEffect
      // setLoading will be set to false there.
    });
    return () => unsubscribe();
  }, []); // Runs once on mount

  // Effect for fetching user profile and setting role when currentUser changes
  useEffect(() => {
    const fetchProfileAndSetRole = async (userToFetchProfileFor: User) => {
      setLoading(true); // Start loading for profile fetch
      setNgoProfile(null);
      setDonorProfile(null);
      setUserRole(null);

      if (!firebaseDb) {
        console.error("AuthContext: Firestore DB instance is not available for profile fetch.");
        setLoading(false);
        return;
      }

      // Try to fetch NGO profile
      const ngoDocRef = doc(firebaseDb, 'ngos', userToFetchProfileFor.uid);
      try {
        const ngoDocSnap = await getDoc(ngoDocRef);
        if (ngoDocSnap.exists()) {
          setNgoProfile({ uid: userToFetchProfileFor.uid, ...ngoDocSnap.data() } as NGO);
          setUserRole('ngo');
          setLoading(false);
          return; // Found NGO profile, role set, exit
        }
      } catch (error) {
        console.error("Error fetching NGO profile:", error);
        toast({
          variant: 'destructive',
          title: 'Profile Error',
          description: 'Could not fetch NGO profile information.',
        });
        // Continue to check for donor profile
      }

      // If not an NGO, try to fetch Donor profile
      const donorDocRef = doc(firebaseDb, 'donors', userToFetchProfileFor.uid);
      try {
        const donorDocSnap = await getDoc(donorDocRef);
        if (donorDocSnap.exists()) {
          setDonorProfile({ uid: userToFetchProfileFor.uid, ...donorDocSnap.data() } as Donor);
          setUserRole('donor');
          setLoading(false);
          return; // Found Donor profile, role set, exit
        }
      } catch (error) {
        console.error("Error fetching Donor profile:", error);
        toast({
          variant: 'destructive',
          title: 'Profile Error',
          description: 'Could not fetch Donor profile information.',
        });
      }
      
      // If no specific profile found after checking both
      console.warn("User is authenticated but no NGO or Donor profile document found for UID:", userToFetchProfileFor.uid);
      setLoading(false); // Finish loading
    };

    if (currentUser) {
      fetchProfileAndSetRole(currentUser);
    } else {
      // No user logged in, reset profiles, role, and finish loading
      setNgoProfile(null);
      setDonorProfile(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [currentUser, toast]); // Dependencies: currentUser and toast

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
      // currentUser will become null via onAuthStateChanged, triggering profile reset
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: error.message || "Failed to logout. Please try again.",
      });
    }
  };

  const refreshUserProfile = useCallback(async () => {
    if (currentUser) {
        // Re-trigger the profile fetching logic by effectively doing what the second useEffect does
        // This is a direct invocation of similar logic for clarity in refresh
        setLoading(true);
        setNgoProfile(null);
        setDonorProfile(null);
        setUserRole(null);

        if (!firebaseDb) {
            console.error("AuthContext: Firestore DB instance is not available for profile refresh.");
            setLoading(false);
            return;
        }

        // Try NGO
        const ngoDocRef = doc(firebaseDb, 'ngos', currentUser.uid);
        try {
            const ngoDocSnap = await getDoc(ngoDocRef);
            if (ngoDocSnap.exists()) {
                setNgoProfile({ uid: currentUser.uid, ...ngoDocSnap.data() } as NGO);
                setUserRole('ngo');
                setLoading(false);
                return;
            }
        } catch (error) { console.error("Refresh NGO Profile Error:", error); }

        // Try Donor
        const donorDocRef = doc(firebaseDb, 'donors', currentUser.uid);
        try {
            const donorDocSnap = await getDoc(donorDocRef);
            if (donorDocSnap.exists()) {
                setDonorProfile({ uid: currentUser.uid, ...donorDocSnap.data() } as Donor);
                setUserRole('donor');
                setLoading(false);
                return;
            }
        } catch (error) { console.error("Refresh Donor Profile Error:", error); }
        
        console.warn("Refresh: No NGO or Donor profile found for UID:", currentUser.uid);
        setLoading(false);
    }
  }, [currentUser, firebaseDb]); // Removed toast as direct dependency to avoid re-creating if toast object changes


  const value = {
    currentUser,
    ngoProfile,
    donorProfile,
    userRole,
    loading,
    logout,
    isFirebaseConfigured,
    refreshUserProfile,
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
