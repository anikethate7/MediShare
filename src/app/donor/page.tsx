
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import type { DonationRequest, NGO } from '@/types';
import { Loader2, ListChecks, Frown, AlertTriangle, HandHeart } from 'lucide-react';
import { DonationRequestCard } from '@/components/DonationRequestCard';
import { useToast } from '@/hooks/use-toast';

export default function DonorPage() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [ngosData, setNgosData] = useState<Record<string, NGO>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        console.error('Error fetching open donation requests:', err); // This console.error IS the place you should look for the link.
        let uiErrorText = 'Could not load donation requests. Please try again later.';
        let toastTitle = 'Error Fetching Requests';
        let toastDescription = uiErrorText;
        let toastDuration = 10000;

        if (err.code === 'failed-precondition') {
          toastTitle = 'Database Index Required';
          toastDescription = "A Firestore index is missing. Please check your browser's developer console for a link to create it.";
          uiErrorText = "Action Required: A Firestore database index is missing.\n\nPlease open your browser's developer console (usually by pressing F12 or right-clicking -> Inspect -> Console).\n\nLook for an error message from Firebase that includes a direct link to create the required index in the Firebase Console. Click that link to resolve this issue.";
          toastDuration = 20000; // Longer duration for this important message
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
  }, [toast, fetchNgoDetails, ngosData]);

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6 mx-auto w-fit">
          <HandHeart className="h-12 w-12 text-accent" />
        </div>
        <h1 className="text-4xl font-headline font-bold mb-2 text-accent">
          Active Donation Requests
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Browse current medicine needs from NGOs. Your contribution can make a significant difference!
        </p>
      </section>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading active requests...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-destructive/10 p-6 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-destructive mb-2">Could Not Load Requests</h3>
          <p className="text-destructive/80 max-w-md mx-auto whitespace-pre-line">{error}</p>
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground/80">No Open Requests</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            There are currently no open donation requests. Thank you for checking!
          </p>
        </div>
      )}

      {!isLoading && !error && requests.length > 0 && (
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

// Removed metadata export
