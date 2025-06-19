
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      setError(null);

      if (!firebaseDb) {
        console.warn("HomepageImpactStories: Firebase DB not configured. Displaying mock stories.");
        setStories(mockImpactStories.slice(0, STORIES_TO_SHOW));
        setError("Displaying sample stories as database is not connected.");
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
        const fetchedStories = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ImpactStory[];
        
        if (fetchedStories.length > 0) {
          setStories(fetchedStories);
        } else {
          // No stories from DB, but DB is connected. Section will not render based on current logic.
          setStories([]); 
        }
      } catch (err: any) {
        console.error('Error fetching impact stories for homepage:', err);
        let uiErrorText = 'Could not load recent impact stories. Showing sample stories instead.';
        setError(uiErrorText);
        setStories(mockImpactStories.slice(0, STORIES_TO_SHOW)); 
        toast({
            variant: 'default',
            title: 'Trouble Fetching Stories',
            description: uiErrorText,
            duration: 7000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [toast]);

  if (isLoading) {
    return (
      <section className="w-full max-w-5xl mx-auto py-8 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-accent">
            Recent Impact Stories
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading recent stories...</p>
        </div>
      </section>
    );
  }

  // Render section if there are stories (either fetched or mock due to error/no DB)
  if (stories.length === 0) { 
    return null;
  }

  return (
    <section className="w-full max-w-5xl mx-auto py-10 md:py-16 animate-fade-in">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-6 md:gap-y-8">
        {stories.map(story => (
          <ImpactStoryCard key={story.id} story={story} />
        ))}
      </div>
      
      {error && ( // Display the error message if mock stories are shown due to an issue
        <p className="text-center text-sm text-muted-foreground mt-6 bg-muted/50 p-3 rounded-md">{error}</p>
      )}

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
