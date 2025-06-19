
'use client';

import React, { useTransition, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, BookOpen, FileText, Link as LinkIcon, Feather, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const createStoryFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(150),
  storyContent: z.string().min(50, 'Story content must be at least 50 characters.').max(5000),
  imageUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  imageAiHint: z.string().max(50, 'AI hint too long (max 2 words recommended)').optional().or(z.literal('')),
});

type CreateStoryFormValues = z.infer<typeof createStoryFormSchema>;

interface CreateImpactStoryFormProps {
  ngoUid: string;
  ngoName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateImpactStoryForm({
  ngoUid,
  ngoName,
  onSuccess,
  onCancel,
}: CreateImpactStoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<CreateStoryFormValues>({
    resolver: zodResolver(createStoryFormSchema),
    defaultValues: {
      title: '',
      storyContent: '',
      imageUrl: '',
      imageAiHint: 'community help',
    },
  });

  async function onSubmit(data: CreateStoryFormValues) {
    if (!firebaseDb) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Database not configured. Cannot create story.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await addDoc(collection(firebaseDb, 'impactStories'), {
          ngoUid,
          ngoName,
          title: data.title,
          storyContent: data.storyContent,
          imageUrl: data.imageUrl || '', // Ensure empty string if undefined
          'data-ai-hint': data.imageAiHint || (data.imageUrl ? 'charity impact' : ''),
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Story Submitted!',
          description: 'Your impact story has been shared.',
        });
        form.reset();
        onSuccess();
      } catch (error: any) {
        console.error('Error creating impact story document:', error);
        toast({
          variant: 'destructive',
          title: 'Story Submission Failed',
          description: error.message || 'An unexpected error occurred while saving the story. Please try again.',
        });
      }
    });
  }

  const handleCancel = () => {
    form.reset();
    onCancel();
  }

  return (
    <DialogContent className="sm:max-w-lg md:max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Feather className="h-6 w-6 text-accent" />
          Share an Impact Story
        </DialogTitle>
        <DialogDescription>
          Inspire donors by sharing how donations have helped your community.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Story Title</FormLabel>
                <FormControl>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., A New Lease on Life for Mrs. Sharma" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="storyContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Story Content</FormLabel>
                <FormControl>
                  <div className="relative">
                     <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Describe the impact of a donation. Be specific and heartwarming, but ensure you have consent if sharing personal details."
                      className="resize-y min-h-[150px] md:min-h-[200px] pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  Image URL (Optional)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="url" placeholder="https://example.com/image.png" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormDescription>
                  Link to an image for your story. Ensure it's publicly accessible.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {form.watch('imageUrl') && (
            <div className="mt-2">
              <FormLabel>Image Preview (from URL)</FormLabel>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={form.watch('imageUrl')} 
                alt="Selected image preview" 
                className="mt-1 max-h-40 w-auto rounded-md border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevents looping if placeholder also fails
                  target.src = 'https://placehold.co/300x200.png?text=Invalid+URL';
                  target.alt = 'Invalid or inaccessible image URL';
                }}
              />
            </div>
          )}

           <FormField
            control={form.control}
            name="imageAiHint"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  Image AI Hint (Optional)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., children smiling, medical camp" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormDescription>
                    Keywords for placeholder or AI image description (max 2 words, e.g., "happy children", "medical help").
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Story...
                </>
              ) : (
                'Submit Story'
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

