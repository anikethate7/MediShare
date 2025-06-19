
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import type { ImpactStory } from '@/types';
import { Loader2, BookOpenText, Frown, AlertTriangle, ArrowRight } from 'lucide-react';
import { ImpactStoryCard } from '@/components/ImpactStoryCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mockImpactStories } from '@/data/mockData';

const STORIES_TO_SHOW = 3; 

export function HomepageImpactStoriesSection() {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null); // Renamed from error for clarity
  const { toast } = useToast();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      setStatusMessage(null);

      if (!firebaseDb) {
        console.warn("HomepageImpactStories: Firebase DB not configured. Displaying mock stories.");
        setStories(mockImpactStories.slice(0, STORIES_TO_SHOW));
        setStatusMessage("Displaying sample stories as database is not connected.");
        setIsLoading(false);
        return;
      }

      try {
        const storiesQuery = query(
          collection(firebaseDb, 'impactStories'),
          orderBy('createdAt', 'desc'),
          limit(STORIES_TO_SHOW)
        );
        const querySnapshot = await getDocs(storiesQuery);
        
        if (querySnapshot.empty) {
          setStories(mockImpactStories.slice(0, STORIES_TO_SHOW));
          setStatusMessage("No live impact stories found. Displaying sample stories for demonstration.");
        } else {
          const fetchedStories = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ImpactStory[];
          setStories(fetchedStories);
        }
      } catch (err: any) {
        console.error('Error fetching impact stories for homepage:', err);
        let uiErrorText = 'Could not load recent impact stories. Showing sample stories instead.';
        let toastTitle = 'Trouble Fetching Stories';
        
        if (err.code === 'permission-denied') {
          uiErrorText = "Could not load stories due to missing permissions. Please check your Firestore security rules. Showing sample stories instead.";
          toastTitle = 'Permission Error';
        } else if (err.code === 'failed-precondition') {
           uiErrorText = "A Firestore index might be missing for 'impactStories'. Showing sample stories instead.";
           toastTitle = 'Database Index Required';
        }
        
        setStatusMessage(uiErrorText); // Use statusMessage to display issues
        setStories(mockImpactStories.slice(0, STORIES_TO_SHOW)); 
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

  if (isLoading) {
    return (
      <section className="w-full mx-auto py-8 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-3 md:mb-4 mx-auto w-fit">
            <BookOpenText className="h-8 w-8 md:h-10 md:w-10 text-accent" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-accent">
            Making a Difference
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading recent stories...</p>
        </div>
      </section>
    );
  }
  
  // No stories to show at all (neither fetched nor mock, which shouldn't happen with current logic unless mockImpactStories is empty)
  if (stories.length === 0 && !statusMessage) { 
    return (
      <section className="w-full mx-auto py-8 md:py-12">
        <div className="text-center mb-6 md:mb-8">
           <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-3 md:mb-4 mx-auto w-fit">
            <BookOpenText className="h-8 w-8 md:h-10 md:w-10 text-accent" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-accent">
            Making a Difference
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Frown className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground/80">No Impact Stories Available</h3>
          <p className="text-muted-foreground mt-1 md:mt-2 max-w-md mx-auto text-sm md:text-base">
            Check back soon to see how donations are helping!
          </p>
        </div>
         <div className="mt-8 md:mt-12 text-center">
            <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 hover:text-accent text-sm sm:text-base">
            <Link href="/impact-stories">
                View All Impact Stories <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            </Button>
        </div>
      </section>
    );
  }
  
  // If mock data is empty and no status message, effectively hide.
  if (stories.length === 0) {
    return null; 
  }

  return (
    <section className="w-full mx-auto py-10 md:py-16 animate-fade-in">
      <div className="text-center mb-6 md:mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-3 md:mb-4 mx-auto w-fit">
          <BookOpenText className="h-8 w-8 md:h-10 md:w-10 text-accent" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-accent mb-1 md:mb-2">
          Making a Difference
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-foreground/70 max-w-lg mx-auto">
          See how donations through MediShare are changing lives.
        </p>
      </div>

      {statusMessage && ( 
        <div className="text-center text-sm text-muted-foreground mb-6 bg-destructive/10 p-3 rounded-md max-w-2xl mx-auto">
            <AlertTriangle className="inline-block h-4 w-4 mr-1.5 text-destructive" />
            {statusMessage}
        </div>
      )}
      
      <div className="flex overflow-x-auto space-x-4 md:space-x-6 py-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-primary/10 scrollbar-thumb-rounded-full">
        {stories.map(story => (
          <div key={story.id} className="flex-shrink-0 w-72 sm:w-80 md:w-96">
            <ImpactStoryCard story={story} />
          </div>
        ))}
        {stories.length > 0 && <div className="flex-shrink-0 w-1"></div>}
      </div>
      
      <div className="mt-8 md:mt-12 text-center">
        <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 hover:text-accent text-sm sm:text-base">
          <Link href="/impact-stories">
            View All Impact Stories <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
