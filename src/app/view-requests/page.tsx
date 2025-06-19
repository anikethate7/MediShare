
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import type { DonationRequest, NGO } from '@/types';
import { Loader2, ListChecks, Frown, AlertTriangle } from 'lucide-react';
import { DonationRequestCard } from '@/components/DonationRequestCard';
import { useToast } from '@/hooks/use-toast';

export default function ViewRequestsPage() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [ngosData, setNgosData] = useState<Record<string, NGO>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIndexError, setIsIndexError] = useState(false);
  const { toast } = useToast();

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
    const fetchOpenRequests = async () => {
      if (!firebaseDb) {
        setError("Database not configured. Please contact support.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
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
          toastDescription = "A Firestore index is missing for querying donation requests. Please check your browser's developer console (usually F12 -> Console tab) for a direct link from Firebase to create it. Click that link to resolve this issue.";
          uiErrorText = "Action Required: A Firestore database index is missing.\n\nTo view donation requests, a specific index needs to be created in your Firebase Firestore database.\n\n1. Open your browser's developer console (usually by pressing F12 or right-clicking -> Inspect -> Console).\n2. Look for an error message starting with 'FirebaseError: The query requires an index...'.\n3. This error message will contain a direct link. Click this link to go to the Firebase Console and create the missing index.\n\nAfter the index is built (which may take a few minutes), refresh this page.";
          toastDuration = 20000;
        } else if (err.code === 'permission-denied') {
           toastTitle = 'Permission Denied';
          uiErrorText = "You don't have permission to view these requests. Please check your Firestore security rules.";
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
        setIsLoading(false);
      }
    };

    fetchOpenRequests();
  }, [toast]); 

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <section className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 md:mb-6 mx-auto w-fit">
          <ListChecks className="h-10 w-10 md:h-12 md:w-12 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2 text-primary">
          All Active Donation Requests
        </h1>
        <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
          This page shows current needs from NGOs. For the primary donor view, please see "View Requests" in the header.
        </p>
      </section>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading active requests...</p>
        </div>
      )}

      {!isLoading && error && (
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

      {!isLoading && !error && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 md:py-12 text-center">
          <Frown className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground/80">No Open Requests</h3>
          <p className="text-muted-foreground mt-1 md:mt-2 max-w-md mx-auto text-sm md:text-base">
            There are currently no open donation requests. Check back later!
          </p>
        </div>
      )}

      {!isLoading && !error && requests.length > 0 && (
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

// Removed metadata export as it's not allowed in client components
// export const metadata = {
//   title: 'Legacy - Active Donation Requests - MediShare',
//   description: 'Browse and respond to current medicine donation needs from NGOs.',
// };
