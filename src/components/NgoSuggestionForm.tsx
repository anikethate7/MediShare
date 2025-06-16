'use client';

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
import { suggestNgos } from '@/ai/flows/suggest-ngos';
import type { SuggestNgosOutput } from '@/ai/flows/suggest-ngos';
import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  medicineDescription: z.string().min(10, {
    message: 'Medicine description must be at least 10 characters.',
  }).max(500, {
    message: 'Medicine description must not exceed 500 characters.'
  }),
  donorLocation: z.string().min(3, {
    message: 'Location must be at least 3 characters.',
  }).max(100, {
    message: 'Location must not exceed 100 characters.'
  }),
});

type NgoSuggestionFormValues = z.infer<typeof formSchema>;

interface NgoSuggestionFormProps {
  onSuggestionsReady: (suggestions: SuggestNgosOutput | null) => void;
}

export function NgoSuggestionForm({ onSuggestionsReady }: NgoSuggestionFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<NgoSuggestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineDescription: '',
      donorLocation: '',
    },
  });

  function onSubmit(data: NgoSuggestionFormValues) {
    onSuggestionsReady(null); // Clear previous suggestions
    startTransition(async () => {
      try {
        const result = await suggestNgos(data);
        onSuggestionsReady(result);
      } catch (error) {
        console.error('Error fetching NGO suggestions:', error);
        onSuggestionsReady(null);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get NGO suggestions. Please try again.",
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl animate-slide-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
          <Lightbulb className="h-6 w-6 text-accent" />
          Find NGOs for Your Medicine Donation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="medicineDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Medicine Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Unopened pack of Paracetamol 500mg, expires 12/2025. Pain relievers, fever reducers."
                      className="resize-y min-h-[100px]"
                      {...field}
                      aria-describedby="medicine-description-help"
                    />
                  </FormControl>
                  <FormDescription id="medicine-description-help">
                    Describe the medicine(s) you wish to donate. Include name, strength (if known), quantity, and expiry date.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="donorLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Your Location</FormLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., Your City, State or Zip Code" {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Enter your current location to find nearby NGOs.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Getting Suggestions...
                </>
              ) : (
                'Suggest NGOs'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
