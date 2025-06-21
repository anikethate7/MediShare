
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
import { Loader2, BookOpen, FileText, Feather, ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db as firebaseDb, firebaseInitError } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';

const createStoryFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(150),
  storyContent: z.string().min(50, 'Story content must be at least 50 characters.').max(5000),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
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

  const imageUrlValue = form.watch('imageUrl');

  const resetFormState = () => {
    form.reset();
  };

  const handleCancel = () => {
    resetFormState();
    onCancel();
  };

  async function onSubmit(data: CreateStoryFormValues) {
    if (firebaseInitError || !firebaseDb) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: firebaseInitError?.message || 'Firebase is not configured correctly. Cannot create story.',
        duration: 10000,
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
          imageUrl: data.imageUrl || '',
          'data-ai-hint': data.imageAiHint || (data.imageUrl ? 'charity impact' : ''),
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Story Submitted!',
          description: 'Your impact story has been shared.',
        });
        resetFormState();
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
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="url" placeholder="https://example.com/image.png" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormDescription>Paste a public link to an image for your story.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {imageUrlValue && (
            <div className="mt-2 space-y-2">
              <FormLabel>Image Preview</FormLabel>
              <div className="relative w-full max-w-sm aspect-video rounded-md border p-1 overflow-hidden">
                <Image
                  src={imageUrlValue}
                  alt="Image preview"
                  fill
                  sizes="(max-width: 640px) 100vw, 384px"
                  className="rounded-md object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                 <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-muted-foreground text-xs" style={{ display: imageUrlValue ? 'none' : 'flex' }}>
                   Invalid or loading...
                 </div>
              </div>
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
                    <Input placeholder="e.g., children smiling, medical camp" {...field} className="pl-10" disabled={isPending} />
                  </div>
                </FormControl>
                <FormDescription>
                    Keywords for placeholder images if no URL is provided (e.g., "happy children").
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
                  Submitting...
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
