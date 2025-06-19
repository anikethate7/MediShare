
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      setError(null);

      if (!firebaseDb) {
        console.warn("ImpactStoriesPage: Firebase DB not configured. Displaying mock stories.");
        setStories(mockImpactStories); 
        setError("Displaying sample stories as database is not connected.");
        setIsLoading(false);
        return;
      }

      try {
        const storiesQuery = query(
          collection(firebaseDb, 'impactStories'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(storiesQuery);
        const fetchedStories = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ImpactStory[];
        
        if (fetchedStories.length > 0) {
            setStories(fetchedStories);
        } else {
            // No stories from DB, but DB is connected. Show "No stories yet".
            setStories([]);
        }
      } catch (err: any) {
        console.error('Error fetching impact stories:', err);
        let uiErrorText = 'Could not load impact stories. Showing sample stories instead.';
        if (err.code === 'permission-denied') {
          uiErrorText = "You don't have permission to view these stories. Showing sample stories instead.";
        } else if (err.code === 'failed-precondition') {
           uiErrorText = "A Firestore index might be missing. Showing sample stories instead.";
        }
        setError(uiErrorText);
        setStories(mockImpactStories); 
        toast({
            variant: 'default',
            title: 'Error Fetching Stories',
            description: uiErrorText,
            duration: 7000,
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
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4 md:mb-6 mx-auto w-fit">
          <BookOpenText className="h-10 w-10 md:h-12 md:w-12 text-accent" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold mb-2 text-accent">
          All Impact Stories
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
          Discover how donations through MediShare are making a real difference in communities, as shared by NGOs.
        </p>
      </section>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading stories...</p>
        </div>
      )}

      {/* Display error message if mock stories are being shown due to an issue */}
      {!isLoading && error && stories.length > 0 && (
         <div className="mb-6 text-center bg-destructive/10 p-3 rounded-md">
          <AlertTriangle className="h-5 w-5 text-destructive inline-block mr-2" />
          <p className="text-sm text-destructive/90 inline">{error}</p>
        </div>
      )}
      
      {/* Handles the case where DB is connected, fetch succeeded, but no stories exist */}
      {!isLoading && !error && stories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 md:py-12 text-center">
          <Frown className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground/80">No Impact Stories Yet</h3>
          <p className="text-muted-foreground mt-1 md:mt-2 max-w-md mx-auto text-sm md:text-base">
            NGOs haven't shared any impact stories yet. Check back soon to see how donations are helping!
          </p>
        </div>
      )}

      {!isLoading && stories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-8">
          {stories.map(story => (
            <ImpactStoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
