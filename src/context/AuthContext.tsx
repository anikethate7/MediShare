
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { NGO } from '@/types'; // Assuming NGO type might be stored as user profile

interface AuthContextType {
  currentUser: User | null;
  ngoProfile: NGO | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ngoProfile, setNgoProfile] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch NGO profile if user is logged in
        const ngoDocRef = doc(db, 'ngos', user.uid);
        const ngoDocSnap = await getDoc(ngoDocRef);
        if (ngoDocSnap.exists()) {
          setNgoProfile({ uid: user.uid, ...ngoDocSnap.data() } as NGO);
        } else {
          setNgoProfile(null);
        }
      } else {
        setNgoProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    // setCurrentUser(null) and setNgoProfile(null) will be handled by onAuthStateChanged
  };

  const value = {
    currentUser,
    ngoProfile,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
