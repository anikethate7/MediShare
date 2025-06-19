
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import type { DonationRequest, NGO } from '@/types';
import { Loader2, Frown, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { DonationRequestCard } from '@/components/DonationRequestCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DonorDashboardPage() {
  const { currentUser, userRole, donorProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [ngosData, setNgosData] = useState<Record<string, NGO>>({});
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIndexError, setIsIndexError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) { 
      if (!currentUser) {
        router.push('/login-donor'); 
      } else if (userRole === 'ngo') {
        router.push('/ngo-dashboard'); 
      }
    }
  }, [currentUser, userRole, authLoading, router]);

  const fetchNgoDetails = useCallback(async (ngoUid: string): Promise<NGO | null> => {
    if (ngosData[ngoUid]) {
      return ngosData[ngoUid];
    }
    if (!firebaseDb) return null;
    try {
      const ngoDocRef = doc(firebaseDb, 'ngos', ngoUid);
      const ngoDocSnap = await getDoc(ngoDocRef);
      if (ngoDocSnap.exists()) {
        const ngo = { uid: ngoDocSnap.id, ...ngoDocSnap.data() } as NGO;
        setNgosData(prev => ({ ...prev, [ngoUid]: ngo }));
        return ngo;
      }
      return null;
    } catch (err) {
      console.error(`Error fetching NGO details for ${ngoUid}:`, err);
      return null;
    }
  }, [ngosData]);

  useEffect(() => {
    if (!authLoading && currentUser && userRole === 'donor') {
      const fetchOpenRequests = async () => {
        if (!firebaseDb) {
          setError("Database not configured. Please contact support.");
          setIsLoadingRequests(false);
          return;
        }
        setIsLoadingRequests(true);
        setError(null);
        setIsIndexError(false);
        try {
          const requestsQuery = query(
            collection(firebaseDb, 'donationRequests'),
            where('status', '==', 'Open'),
            orderBy('urgency', 'asc'),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(requestsQuery);
          const fetchedRequests = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as DonationRequest[];
          
          setRequests(fetchedRequests);

        } catch (err: any) {
          console.error('Error fetching open donation requests:', err);
          let uiErrorText = 'Could not load donation requests. Please try again later.';
          let toastTitle = 'Error Fetching Requests';
          let toastDescription = uiErrorText;
          let toastDuration = 10000;

          if (err.code === 'failed-precondition') {
            setIsIndexError(true);
            toastTitle = 'Database Index Required';
            toastDescription = "A Firestore index is missing. Check your browser's developer console (F12) for a Firebase link to create it.";
            uiErrorText = "Action Required: A Firestore database index is missing.\n\nTo view donation requests, a specific index needs to be created in your Firebase Firestore database.\n\n1. Open your browser's developer console (usually by pressing F12 or right-clicking -> Inspect -> Console).\n2. Look for an error message starting with 'FirebaseError: The query requires an index...'.\n3. This error message will contain a direct link. Click this link to go to the Firebase Console and create the missing index.\n\nAfter the index is built (which may take a few minutes), refresh this page.";
            toastDuration = 20000;
          } else if (err.code === 'permission-denied') {
            toastTitle = 'Permission Denied';
            uiErrorText = "You don't have permission to view these requests. Check Firestore rules.";
            toastDescription = uiErrorText;
          } else {
            uiErrorText = err.message || uiErrorText;
            toastDescription = uiErrorText;
          }
          setError(uiErrorText);
          toast({
              variant: 'destructive',
              title: toastTitle,
              description: toastDescription,
              duration: toastDuration,
          });
        } finally {
          setIsLoadingRequests(false);
        }
      };
      fetchOpenRequests();
    } else if (!authLoading && (!currentUser || userRole !== 'donor')) {
      setIsLoadingRequests(false);
    }
  }, [currentUser, userRole, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin text-accent" />
      </div>
    );
  }
  
  if (!currentUser || userRole !== 'donor') {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4 md:p-6">
        <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-destructive mb-3 md:mb-4" />
        <h1 className="text-xl md:text-2xl font-semibold text-destructive mb-1 md:mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          This dashboard is for registered donors only. Please log in as a donor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <section className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4 md:mb-6 mx-auto w-fit">
          <LayoutDashboard className="h-10 w-10 md:h-12 md:w-12 text-accent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2 text-accent">
          Donor Dashboard
        </h1>
        <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
          Welcome, {donorProfile?.name || 'Donor'}! Browse active medicine needs from NGOs.
        </p>
      </section>

      {isLoadingRequests && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading active requests...</p>
        </div>
      )}

      {!isLoadingRequests && error && (
        <div className="flex flex-col items-center justify-center py-10 md:py-12 text-center bg-destructive/10 p-4 md:p-6 rounded-lg">
          <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 text-destructive mx-auto mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-destructive mb-1 md:mb-2">
            {isIndexError ? "Database Index Required" : "Could Not Load Requests"}
          </h3>
          <p className="text-destructive/80 max-w-md mx-auto whitespace-pre-line text-sm md:text-base">{error}</p>
          {isIndexError && (
            <p className="text-xs text-destructive/70 mt-2 md:mt-3">
              Please follow the instructions above or in the toast notification. The developer console (F12) will contain the direct link from Firebase.
            </p>
          )}
        </div>
      )}

      {!isLoadingRequests && !error && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 md:py-12 text-center">
          <Frown className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground/80">No Open Requests</h3>
          <p className="text-muted-foreground mt-1 md:mt-2 max-w-md mx-auto text-sm md:text-base">
            There are currently no open donation requests. Thank you for checking!
          </p>
        </div>
      )}

      {!isLoadingRequests && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-8">
          {requests.map(request => (
            <DonationRequestCard
              key={request.id}
              request={request}
              ngo={ngosData[request.ngoUid] || null}
              fetchNgoDetails={fetchNgoDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
