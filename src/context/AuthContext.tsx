
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
  donorProfile: Donor | null; // Added donorProfile
  userRole: UserRole;
  loading: boolean;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean;
  refreshUserProfile: () => Promise<void>; // Renamed for clarity
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ngoProfile, setNgoProfile] = useState<NGO | null>(null);
  const [donorProfile, setDonorProfile] = useState<Donor | null>(null); // New state for donor profile
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(!firebaseInitError && !!firebaseAuth);
  const { toast } = useToast();

  const fetchUserProfileAndSetRole = useCallback(async (user: User | null) => {
    setNgoProfile(null); // Reset profiles
    setDonorProfile(null);
    setUserRole(null);

    if (user && firebaseDb) {
      // Try to fetch NGO profile
      const ngoDocRef = doc(firebaseDb, 'ngos', user.uid);
      try {
        const ngoDocSnap = await getDoc(ngoDocRef);
        if (ngoDocSnap.exists()) {
          setNgoProfile({ uid: user.uid, ...ngoDocSnap.data() } as NGO);
          setUserRole('ngo');
          return; // Found NGO profile, role set, exit
        }
      } catch (error) {
          console.error("Error fetching NGO profile:", error);
           toast({
              variant: 'destructive',
              title: 'Profile Error',
              description: 'Could not fetch NGO profile information.',
          });
          // Do not return yet, try fetching donor profile
      }

      // If not an NGO, try to fetch Donor profile
      const donorDocRef = doc(firebaseDb, 'donors', user.uid);
      try {
        const donorDocSnap = await getDoc(donorDocRef);
        if (donorDocSnap.exists()) {
          setDonorProfile({ uid: user.uid, ...donorDocSnap.data()} as Donor);
          setUserRole('donor');
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
      
      // If no specific profile found after checking both, user is authenticated but has no specific role document.
      // This could be a user who registered but profile creation failed, or an admin, or other future role.
      // For now, if they are authenticated but no specific profile, what should be the role?
      // Let's keep it null for now, or you might decide to default to 'donor'.
      if (user && !ngoProfile && !donorProfile) {
        console.warn("User is authenticated but no NGO or Donor profile document found for UID:", user.uid);
        // setUserRole('donor'); // Optional: default to donor if no profile found
      }

    }
  }, [toast, ngoProfile, donorProfile]); // Added donorProfile to dependencies


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
      await fetchUserProfileAndSetRole(user); // This now checks for both NGO and Donor profiles
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfileAndSetRole]);

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
      // State updates (currentUser, profiles, userRole to null) will be handled by onAuthStateChanged
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
        setLoading(true);
        await fetchUserProfileAndSetRole(currentUser);
        setLoading(false);
    }
  }, [currentUser, fetchUserProfileAndSetRole]);


  const value = {
    currentUser,
    ngoProfile,
    donorProfile, // Provide donorProfile
    userRole,
    loading,
    logout,
    isFirebaseConfigured,
    refreshUserProfile, // Renamed function
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
