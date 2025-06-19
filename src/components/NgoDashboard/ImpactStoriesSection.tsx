
'use client';

import React, { useState, useEffect, useCallback, useTransition, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import type { ImpactStory } from '@/types';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { BookHeart, PlusCircle, Loader2, Frown, Edit3, Trash2 } from 'lucide-react'; // Edit3, Trash2 for future
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const CreateImpactStoryForm = React.lazy(() =>
  import('./CreateImpactStoryForm').then(module => ({ default: module.CreateImpactStoryForm }))
);

export function ImpactStoriesSection() {
  const { currentUser, ngoProfile } = useAuth();
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // const [isUpdatingStatus, startUpdateTransition] = useTransition(); // For future edit/delete
  const { toast } = useToast();

  const fetchStories = useCallback(async () => {
    if (!currentUser || !firebaseDb) return;
    setIsLoadingStories(true);
    try {
      const storiesQuery = query(
        collection(firebaseDb, 'impactStories'),
        where('ngoUid', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(storiesQuery);
      const fetchedStories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ImpactStory[];
      setStories(fetchedStories);
    } catch (error: any) {
      console.error('Error fetching impact stories:', error);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Stories',
        description: error.message || 'Could not load your impact stories.',
      });
    } finally {
      setIsLoadingStories(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleStoryCreated = useCallback(() => {
    setIsCreateDialogOpen(false);
    fetchStories(); // Refresh the list
  }, [fetchStories]);

  // Placeholder for future edit/delete functionality
  // const handleDeleteStory = async (storyId: string) => { /* ... */ };
  // const handleEditStory = (story: ImpactStory) => { /* ... */ };

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BookHeart className="h-6 w-6 text-accent" />
            Your Impact Stories
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Share stories of how donations have made a difference.
          </CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm mt-2 sm:mt-0 w-full sm:w-auto"
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Story
            </Button>
          </DialogTrigger>
          {isCreateDialogOpen && ngoProfile && currentUser && (
            <Suspense fallback={<div className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" /></div>}>
              <CreateImpactStoryForm
                ngoUid={currentUser.uid}
                ngoName={ngoProfile.name}
                onSuccess={handleStoryCreated}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </Suspense>
          )}
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoadingStories ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-accent" />
            <p className="ml-3 text-muted-foreground">Loading your stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="py-8 text-center">
            <Frown className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-md md:text-lg font-semibold text-foreground/80">
              No Impact Stories Yet
            </p>
            <p className="text-muted-foreground mt-1 text-sm md:text-base max-w-md mx-auto">
              Click "Add New Story" to share how donations have helped your community.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map(story => (
              <div key={story.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-md md:text-lg text-primary">{story.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Posted: {story.createdAt ? format(story.createdAt.toDate(), 'PPp') : 'N/A'}
                    </p>
                  </div>
                  {/* Future Edit/Delete Buttons
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditStory(story)} className="h-7 w-7 text-muted-foreground hover:text-primary">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStory(story.id!)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  */}
                </div>
                <p className="text-sm text-foreground/80 mt-2 line-clamp-3">
                  {story.storyContent}
                </p>
                {story.imageUrl && (
                    <p className="text-xs text-accent mt-2 italic">Image included.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
