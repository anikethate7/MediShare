
'use client';

import React, { useState, useEffect } from 'react';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import type { ImpactStory } from '@/types';
import { Loader2, BookOpenText, Frown, AlertTriangle } from 'lucide-react';
import { ImpactStoryCard } from '@/components/ImpactStoryCard';
import { useToast } from '@/hooks/use-toast';
import { mockImpactStories } from '@/data/mockData';

export default function ImpactStoriesPage() {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null); // Renamed from error
  const { toast } = useToast();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      setStatusMessage(null);

      if (!firebaseDb) {
        console.warn("ImpactStoriesPage: Firebase DB not configured. Displaying mock stories.");
        setStories(mockImpactStories); 
        setStatusMessage("Displaying sample stories as database is not connected.");
        setIsLoading(false);
        return;
      }

      try {
        const storiesQuery = query(
          collection(firebaseDb, 'impactStories'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(storiesQuery);
        
        if (querySnapshot.empty) {
          setStories(mockImpactStories);
          setStatusMessage("No live impact stories found. Displaying sample stories for demonstration.");
        } else {
          const fetchedStories = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ImpactStory[];
          setStories(fetchedStories);
        }
      } catch (err: any) {
        console.error('Error fetching impact stories:', err);
        let uiErrorText = 'Could not load impact stories. Showing sample stories instead.';
        let toastTitle = 'Error Fetching Stories';
        
        if (err.code === 'permission-denied') {
          uiErrorText = "Could not load stories due to missing permissions. Please check your Firestore security rules. Showing sample stories instead.";
          toastTitle = 'Permission Error';
        } else if (err.code === 'failed-precondition') {
           uiErrorText = "A Firestore index might be missing for 'impactStories'. Showing sample stories instead.";
           toastTitle = 'Database Index Required';
        }
        
        setStatusMessage(uiErrorText);
        setStories(mockImpactStories); 
        toast({
            variant: err.code === 'permission-denied' ? 'destructive' : 'default',
            title: toastTitle,
            description: uiErrorText,
            duration: 10000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [toast]);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold uppercase tracking-wider text-primary">
          Support a Cause
        </h1>
      </section>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading stories...</p>
        </div>
      )}

      {statusMessage && stories.length > 0 && ( // Only show status message if there are stories (likely mock ones)
         <div className="mb-6 text-center bg-destructive/10 p-3 rounded-md">
          <AlertTriangle className="h-5 w-5 text-destructive inline-block mr-2" />
          <p className="text-sm text-destructive/90 inline">{statusMessage}</p>
        </div>
      )}
      
      {!isLoading && stories.length === 0 && !statusMessage && ( // True "no stories" state
        <div className="flex flex-col items-center justify-center py-10 md:py-12 text-center">
          <Frown className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground/80">No Impact Stories Yet</h3>
          <p className="text-muted-foreground mt-1 md:mt-2 max-w-md mx-auto text-sm md:text-base">
            NGOs haven't shared any impact stories yet. Check back soon to see how donations are helping!
          </p>
        </div>
      )}

      {!isLoading && stories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {stories.map(story => (
            <ImpactStoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
