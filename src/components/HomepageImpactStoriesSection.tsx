
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

const STORIES_TO_SHOW = 4; 

export function HomepageImpactStoriesSection() {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
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
        
        setStatusMessage(uiErrorText); 
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
      <section className="w-full max-w-6xl mx-auto py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl font-headline font-bold uppercase tracking-wider text-primary">
            Support a Cause
          </h2>
        </div>
        <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </section>
    );
  }
  
  if (stories.length === 0) {
    return null; 
  }

  return (
    <section className="w-full max-w-6xl mx-auto py-12 md:py-16 animate-fade-in">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-3xl sm:text-4xl font-headline font-bold uppercase tracking-wider text-primary">
          Support a Cause
        </h2>
      </div>

      {statusMessage && ( 
        <div className="text-center text-sm text-muted-foreground mb-6 bg-destructive/10 p-3 rounded-md max-w-2xl mx-auto">
            <AlertTriangle className="inline-block h-4 w-4 mr-1.5 text-destructive" />
            {statusMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
        {stories.map(story => (
          <ImpactStoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}
