
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import type { DonationRequest, NGO } from '@/types';
import { Loader2, ListChecks, Frown, AlertTriangle, LayoutDashboard } from 'lucide-react';
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
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login-donor');
      } else if (userRole === 'ngo') {
        // Redirect NGO to their own dashboard if they land here
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
    // Only fetch requests if user is a donor and authenticated
    if (currentUser && userRole === 'donor') {
      const fetchOpenRequests = async () => {
        if (!firebaseDb) {
          setError("Database not configured. Please contact support.");
          setIsLoadingRequests(false);
          return;
        }
        setIsLoadingRequests(true);
        setError(null);
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

          const uniqueNgoUids = Array.from(new Set(fetchedRequests.map(req => req.ngoUid)));
          const ngoPromises = uniqueNgoUids.map(uid => {
            if (!ngosData[uid]) {
              return fetchNgoDetails(uid);
            }
            return Promise.resolve(ngosData[uid]);
          });
          await Promise.all(ngoPromises);

        } catch (err: any) {
          console.error('Error fetching open donation requests:', err);
          let toastTitle = 'Error Fetching Requests';
          let toastDescription = 'Could not load donation requests. Please try again later.';
          let toastDuration = 10000;

          if (err.code === 'failed-precondition') {
            toastTitle = 'Database Index Required';
            toastDescription = "The query requires an index. Check Firestore indexing. The console might have a link to create it.";
            toastDuration = 15000;
          } else if (err.code === 'permission-denied') {
            toastDescription = "You don't have permission to view these requests. Check Firestore security rules.";
          } else {
            toastDescription = err.message || toastDescription;
          }
          setError(toastDescription); // Set the error state for UI display
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
    } else if (!authLoading && currentUser && userRole !== 'donor') {
      // If user is logged in but not a donor (e.g. NGO), don't load requests for this page
      setIsLoadingRequests(false);
    } else if (!authLoading && !currentUser) {
      setIsLoadingRequests(false); // Not logged in, do nothing
    }
  }, [currentUser, userRole, authLoading, toast, fetchNgoDetails, ngosData]);

  if (authLoading || (!currentUser && !authLoading && !donorProfile)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (userRole !== 'donor') {
    // This case should be handled by redirection, but as a fallback:
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          This dashboard is for donors.
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-fade-in">
      <section className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6 mx-auto w-fit">
          <LayoutDashboard className="h-12 w-12 text-accent" />
        </div>
        <h1 className="text-4xl font-headline font-bold mb-2 text-accent">
          Donor Dashboard
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Welcome, {donorProfile?.name || 'Donor'}! Browse active medicine needs from NGOs. Your contribution can make a difference.
        </p>
      </section>

      {isLoadingRequests && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading active requests...</p>
        </div>
      )}

      {!isLoadingRequests && error && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-destructive/10 p-6 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-destructive mb-2">Could Not Load Requests</h3>
          <p className="text-destructive/80 max-w-md mx-auto">{error}</p>
        </div>
      )}

      {!isLoadingRequests && !error && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground/80">No Open Requests</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            There are currently no open donation requests. Thank you for checking!
          </p>
        </div>
      )}

      {!isLoadingRequests && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
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

