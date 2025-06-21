
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
import { Progress } from '@/components/ui/progress';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, BookOpen, FileText, Feather, ImageIcon, Upload, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db as firebaseDb, storage as firebaseStorage, firebaseInitError } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, type UploadTask } from "firebase/storage";
import Image from 'next/image';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);


  const form = useForm<CreateStoryFormValues>({
    resolver: zodResolver(createStoryFormSchema),
    defaultValues: {
      title: '',
      storyContent: '',
      imageAiHint: 'community help',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadError('File is too large. Please select an image smaller than 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };
  
  const resetFormState = () => {
    form.reset();
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(null);
    setUploadError(null);
  };

  const handleCancel = () => {
    resetFormState();
    onCancel();
  };

  async function onSubmit(data: CreateStoryFormValues) {
    setUploadError(null);
    if (firebaseInitError || !firebaseDb || !firebaseStorage) {
        let errorDesc = firebaseInitError?.message || 'Firebase is not configured correctly. Cannot create story.';
        if (!firebaseStorage) {
            errorDesc = "Firebase Storage is not configured. Please ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set in your .env.local file and is correct.";
        }
        toast({
            variant: 'destructive',
            title: 'Configuration Error',
            description: errorDesc,
            duration: 10000,
        });
        return;
    }

    startTransition(async () => {
      let imageUrl = '';

      // --- New, more robust upload logic ---
      if (selectedFile) {
        setUploadProgress(0);
        const storageRef = ref(firebaseStorage, `impact_stories/${ngoUid}/${Date.now()}_${selectedFile.name}`);
        const uploadTask: UploadTask = uploadBytesResumable(storageRef, selectedFile);

        // Listen for progress updates separately
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          }
        );

        try {
          // Await the completion of the upload
          await uploadTask;
          
          // Get the download URL once the upload is complete
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

        } catch (error: any) {
          console.error("Upload Error:", error);
          let description = 'Image upload failed. Please try again.';

          if (error.code === 'storage/unauthorized') {
            description = "Permission denied. Please ensure your Firebase Storage rules allow uploads for authenticated users (check the 'storage.rules' file).";
          } else if (error.code === 'storage/canceled') {
            description = "Upload was canceled.";
          } else if (error.code === 'storage/unknown' || error.message.includes("Cors")) {
            description = "A CORS policy error occurred. This is a cloud configuration issue. Please ensure your Storage bucket's CORS settings in Google Cloud are configured to allow requests from your app's domain.";
          }
          
          setUploadError(description);
          toast({ variant: 'destructive', title: 'Upload Failed', description: "See the error message in the form for details.", duration: 15000 });
          setUploadProgress(null);
          return; // Stop the form submission if upload fails
        }
      }
      // --- End of new upload logic ---

      try {
        await addDoc(collection(firebaseDb, 'impactStories'), {
          ngoUid,
          ngoName,
          title: data.title,
          storyContent: data.storyContent,
          imageUrl: imageUrl,
          'data-ai-hint': data.imageAiHint || (imageUrl ? 'charity impact' : ''),
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
      } finally {
        setUploadProgress(null);
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

          <div className="space-y-2">
            <FormLabel htmlFor="image-upload">Upload Image (Optional)</FormLabel>
            <Input 
                id="image-upload" 
                type="file" 
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isPending}
             />
            <FormDescription>Select an image from your device (max 5MB).</FormDescription>
            {uploadError && (
                 <div className="flex items-start gap-2 p-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                     <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{uploadError}</p>
                </div>
            )}
          </div>

          {previewUrl && (
            <div className="mt-2 space-y-2">
              <FormLabel>Image Preview</FormLabel>
              <div className="relative w-full max-w-sm aspect-video rounded-md border p-1">
                 <Image 
                    src={previewUrl} 
                    alt="Selected image preview" 
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    className="rounded-md object-cover"
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 rounded-full z-10"
                    onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setUploadError(null);
                        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                        if(fileInput) fileInput.value = "";
                    }}
                    disabled={isPending}
                    >
                    <X className="h-4 w-4" />
                  </Button>
              </div>
            </div>
          )}

          {uploadProgress !== null && (
            <div className="space-y-1">
                <FormLabel>Upload Progress</FormLabel>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
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
                    Keywords for placeholder or AI image description (max 2 words, e.g., "happy children").
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
                  {uploadProgress !== null ? "Uploading..." : "Submitting..."}
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
