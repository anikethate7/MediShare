
'use client';

import React, { useTransition } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, Pill, ClipboardList, AlertTriangle, Info, Thermometer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { UrgencyLevel } from '@/types';

const urgencyLevels: UrgencyLevel[] = ['High', 'Medium', 'Low'];

const createRequestFormSchema = z.object({
  medicineName: z.string().min(3, 'Medicine name must be at least 3 characters.').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(500),
  quantityNeeded: z.string().min(1, 'Quantity is required.').max(50),
  urgency: z.enum(urgencyLevels as [UrgencyLevel, ...UrgencyLevel[]], {
    required_error: 'Urgency level is required.',
  }),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type CreateRequestFormValues = z.infer<typeof createRequestFormSchema>;

interface CreateDonationRequestFormProps {
  ngoUid: string;
  ngoName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateDonationRequestForm({
  ngoUid,
  ngoName,
  onSuccess,
  onCancel,
}: CreateDonationRequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestFormSchema),
    defaultValues: {
      medicineName: '',
      description: '',
      quantityNeeded: '',
      urgency: 'Medium',
      notes: '',
    },
  });

  async function onSubmit(data: CreateRequestFormValues) {
    if (!firebaseDb) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database not configured. Cannot create request.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await addDoc(collection(firebaseDb, 'donationRequests'), {
          ngoUid,
          ngoName,
          ...data,
          status: 'Open', // Default status
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Request Created!',
          description: 'Your medicine donation request has been posted.',
        });
        form.reset();
        onSuccess();
      } catch (error: any) {
        console.error('Error creating donation request:', error);
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: error.message || 'An unexpected error occurred. Please try again.',
        });
      }
    });
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-accent" />
          Create New Medicine Request
        </DialogTitle>
        <DialogDescription>
          Detail the specific medicine your NGO needs. This request will be listed for potential donors.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
          <FormField
            control={form.control}
            name="medicineName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicine Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., Paracetamol 500mg Tablets" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className="relative">
                     <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="e.g., For fever and pain relief. Need strips of 10 tablets."
                      className="resize-y min-h-[80px] pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                 <FormDescription>Include details like strength, form (tablet, syrup), packaging if relevant.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantityNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Needed</FormLabel>
                  <FormControl>
                     <div className="relative">
                       <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g., 50 strips, 10 bottles" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urgency Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                         <div className="flex items-center">
                           <Thermometer className="h-4 w-4 text-muted-foreground mr-2" />
                           <SelectValue placeholder="Select urgency" />
                         </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                   <div className="relative">
                    <Info className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="e.g., Specific brand preferred if possible, storage instructions, etc."
                      className="resize-y min-h-[80px] pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Request...
                </>
              ) : (
                'Create Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
