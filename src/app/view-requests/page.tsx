
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
          orderBy('urgency', 'asc'), // Prioritize High urgency
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(requestsQuery);
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as DonationRequest[];
        
        setRequests(fetchedRequests);

        // Pre-fetch NGO details for all unique NGO UIDs in the requests
        const uniqueNgoUids = Array.from(new Set(fetchedRequests.map(req => req.ngoUid)));
        const ngoPromises = uniqueNgoUids.map(uid => {
          if (!ngosData[uid]) { // Only fetch if not already fetched
            return fetchNgoDetails(uid);
          }
          return Promise.resolve(ngosData[uid]);
        });
        await Promise.all(ngoPromises);

      } catch (err: any) {
        console.error('Error fetching open donation requests:', err);
        let description = 'Could not load donation requests. Please try again later.';
        if (err.code === 'failed-precondition') {
          description = "The query requires an index. Please check Firestore indexing or contact support. The console might contain a direct link to create it.";
           toast({
            variant: 'destructive',
            title: 'Database Index Required',
            description: `A database index is needed to view requests. If you are an admin, please check the browser console for a link to create it in Firebase. Error: ${err.message}`,
            duration: 15000,
          });
        } else if (err.code === 'permission-denied') {
          description = "You don't have permission to view these requests. Please check Firestore security rules.";
        } else {
           description = err.message || description;
        }
        setError(description);
        toast({
            variant: 'destructive',
            title: 'Error Fetching Requests',
            description: description,
            duration: 10000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpenRequests();
  }, [toast, fetchNgoDetails, ngosData]); // Added ngosData to re-evaluate if it changes (though fetchNgoDetails memoizes)

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 mx-auto w-fit">
          <ListChecks className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold mb-2 text-primary">
          Active Donation Requests
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Browse current needs from NGOs. Your contribution can make a difference!
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
          <p className="text-destructive/80 max-w-md mx-auto">{error}</p>
          <p className="text-xs text-destructive/70 mt-3">If this problem persists, please contact support or check the browser console for more details.</p>
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground/80">No Open Requests</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            There are currently no open donation requests. Check back later!
          </p>
        </div>
      )}

      {!isLoading && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {requests.map(request => (
            <DonationRequestCard
              key={request.id}
              request={request}
              ngo={ngosData[request.ngoUid] || null} // Pass memoized NGO data
              fetchNgoDetails={fetchNgoDetails} // Pass down the memoized fetch function
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Active Donation Requests - MediShare',
  description: 'Browse and respond to current medicine donation needs from NGOs.',
};

