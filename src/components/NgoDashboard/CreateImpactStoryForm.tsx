
'use client';

import React, { useTransition, useState, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, BookOpen, FileText, Image as ImageIcon, Feather, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db as firebaseDb, storage as firebaseStorage } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const createStoryFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(150),
  storyContent: z.string().min(50, 'Story content must be at least 50 characters.').max(5000),
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateStoryFormValues>({
    resolver: zodResolver(createStoryFormSchema),
    defaultValues: {
      title: '',
      storyContent: '',
      imageAiHint: 'community help',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Image size should not exceed 5MB.",
        });
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image (PNG, JPG, GIF, WEBP).",
        });
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  async function onSubmit(data: CreateStoryFormValues) {
    if (!firebaseDb || !firebaseStorage) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Database or Storage not configured. Cannot create story.',
      });
      return;
    }

    startTransition(async () => {
      let uploadedImageUrl = '';

      if (imageFile) {
        setUploadProgress(0);
        const storagePath = `impact_stories/${ngoUid}/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(firebaseStorage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        try {
          await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
              },
              (error) => {
                console.error("Upload failed during task:", error);
                reject(error);
              },
              async () => {
                uploadedImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              }
            );
          });
        } catch (error: any) {
          let title = 'Image Upload Failed';
          let description = 'Could not upload the image. Please check your network connection, CORS settings for Firebase Storage, and try again.';
          if (error.code) {
            description = `Error: ${error.code}. ${error.message || description}`;
            if (error.code === 'storage/unauthorized') {
              title = 'Upload Authorization Failed';
              description = "You are not authorized to upload to this location. Please check your Firebase Storage security rules.";
            } else if (error.code === 'storage/canceled') {
              title = 'Upload Cancelled';
              description = "The image upload was cancelled.";
            } else if (error.code === 'storage/unknown' && error.message && error.message.includes('Cors')) {
              title = 'CORS Issue Suspected';
              description = "The upload failed, possibly due to a CORS misconfiguration on your Firebase Storage bucket. Please verify your bucket's CORS settings.";
            } else if (error.code.startsWith('storage/')) {
                title = 'Storage Error';
            }
          } else if (error.message) {
            description = error.message;
          }
          console.error('Firebase Storage Upload Error Object:', error);
          toast({ variant: 'destructive', title: title, description: description, duration: 15000 });
          setUploadProgress(null);
          return;
        }
        setUploadProgress(null);
      }

      try {
        await addDoc(collection(firebaseDb, 'impactStories'), {
          ngoUid,
          ngoName,
          title: data.title,
          storyContent: data.storyContent,
          imageUrl: uploadedImageUrl,
          'data-ai-hint': data.imageAiHint || (uploadedImageUrl ? 'charity impact' : ''),
          createdAt: serverTimestamp(),
        });
        toast({
          title: 'Story Submitted!',
          description: 'Your impact story has been shared.',
        });
        form.reset();
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

          <FormItem>
            <FormLabel className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
                Story Image (Optional)
            </FormLabel>
            <FormControl>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </FormControl>
            <FormDescription>Upload an image (max 5MB). PNG, JPG, GIF, WEBP accepted.</FormDescription>
          </FormItem>

          {imagePreview && (
            <div className="mt-2">
              <FormLabel>Image Preview</FormLabel>
              <img src={imagePreview} alt="Selected image preview" className="mt-1 max-h-40 w-auto rounded-md border" />
            </div>
          )}

          {uploadProgress !== null && (
            <div className="space-y-1 mt-2">
              <FormLabel>Upload Progress</FormLabel>
              <Progress value={uploadProgress} className="w-full [&>div]:bg-accent" />
              <p className="text-xs text-muted-foreground">{uploadProgress.toFixed(0)}% uploaded</p>
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
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending || uploadProgress !== null}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress !== null ? 'Uploading Image...' : 'Submitting Story...'}
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
