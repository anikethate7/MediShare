
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import type { DonationRequest } from '@/types';
import { Loader2, ListChecks, Frown, AlertTriangle, ArrowRight, Pill, Building, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNowStrict } from 'date-fns';


const REQUESTS_TO_SHOW = 3;

export function LatestRequestsSection() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLatestRequests = async () => {
      setIsLoading(true);
      setError(null);

      if (!firebaseDb) {
        setError("Database not configured. Cannot display urgent requests.");
        setIsLoading(false);
        return;
      }

      try {
        const requestsQuery = query(
          collection(firebaseDb, 'donationRequests'),
          where('status', '==', 'Open'),
          where('urgency', '==', 'High'), // Only fetch High urgency requests
          orderBy('createdAt', 'desc'),
          limit(REQUESTS_TO_SHOW)
        );
        const querySnapshot = await getDocs(requestsQuery);
        const fetchedRequests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as DonationRequest[];
        
        setRequests(fetchedRequests);
      } catch (err: any) {
        console.error('Error fetching high urgency requests:', err);
        let uiErrorText = 'Could not load urgent donation requests.';
         if (err.code === 'failed-precondition') {
           uiErrorText = "A Firestore index is missing. Please check the developer console (F12) for a link to create it. This is needed to show urgent requests.";
           toast({ variant: 'destructive', title: 'Database Index Required', description: uiErrorText, duration: 15000 });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: uiErrorText });
        }
        setError(uiErrorText);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestRequests();
  }, [toast]);
  
  const getUrgencyBadgeVariant = (urgency: DonationRequest['urgency']) => {
    switch (urgency) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };


  return (
    <section className="w-full max-w-5xl mx-auto py-10 md:py-16">
      <div className="text-center mb-8 md:mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-3 md:mb-4 mx-auto w-fit">
          <ListChecks className="h-8 w-8 md:h-10 md:w-10 text-accent" />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-accent mb-1 md:mb-2">
          Urgent Medicine Requirements
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-xl mx-auto">
          A quick look at the current "High" priority needs from NGOs.
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading urgent requests...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center bg-destructive/10 p-4 md:p-6 rounded-lg max-w-md mx-auto">
          <AlertTriangle className="h-8 w-8 md:h-10 md:w-10 text-destructive mx-auto mb-3" />
          <h3 className="text-md md:text-lg font-semibold text-destructive mb-1">Error Loading Requests</h3>
          <p className="text-sm text-destructive/80 whitespace-pre-line">{error}</p>
        </div>
      )}
      
      {!isLoading && !error && requests.length === 0 && (
        <div className="text-center py-10">
          <Frown className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground/80">No "High" Urgency Requests</h3>
          <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-md mx-auto">
            There are currently no "High" urgency donation requests listed.
          </p>
        </div>
      )}

      {!isLoading && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {requests.map(request => (
            <Card key={request.id} className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden group">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-md md:text-lg font-headline text-primary flex items-center gap-1.5">
                        <Pill className="h-4 w-4 text-primary" />
                        {request.medicineName}
                    </CardTitle>
                    <Badge variant={getUrgencyBadgeVariant(request.urgency)} className="ml-2 shrink-0 text-xs px-1.5 py-0.5">
                        <Thermometer className="h-3 w-3 mr-1" />{request.urgency}
                    </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" /> {request.ngoName}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow px-4 pt-1 pb-3">
                <p className="text-sm text-foreground/80 line-clamp-2">
                  {request.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Needed: {request.quantityNeeded}
                </p>
              </CardContent>
              <CardFooter className="mt-auto border-t pt-2.5 pb-2.5 px-4 flex flex-col items-stretch gap-2">
                 <Button asChild size="sm" variant="outline" className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent">
                    <Link href="/donor">
                        View Details & Offer Help
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                </Button>
                <p className="text-xs text-muted-foreground self-end">
                    Posted {request.createdAt ? formatDistanceToNowStrict(request.createdAt.toDate(), { addSuffix: true }) : 'recently'}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-10 md:mt-12 text-center">
        <Button asChild variant="default" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-base sm:text-lg">
          <Link href="/donor">
            View All Donation Requests <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
