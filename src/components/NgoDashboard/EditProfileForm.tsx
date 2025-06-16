
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Save, Building, MapPin, Phone, Globe, FileText, Clock, ListChecks } from 'lucide-react';
import React, { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ngoTypes } from '@/data/mockData';
import type { NGO } from '@/types';
import { db as firebaseDb } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';


const editProfileFormSchema = z.object({
  ngoName: z.string().min(3, 'NGO name must be at least 3 characters.').max(100, 'NGO name must not exceed 100 characters.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  city: z.string().min(2, 'City must be at least 2 characters.'),
  ngoType: z.enum(ngoTypes as [NGO['type'], ...NGO['type'][]], {
    required_error: "You need to select an NGO type.",
  }),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits.').regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number format.').optional().or(z.literal('')),
  website: z.string().url('Invalid URL. Must include http:// or https://').optional().or(z.literal('')),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(1000, 'Description must not exceed 1000 characters.'),
  operatingHours: z.string().max(100, "Operating hours description too long").optional().or(z.literal('')),
  servicesInput: z.string().max(1000, "Services description too long").optional().or(z.literal('')),
});

type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

interface EditProfileFormProps {
  currentProfile: NGO;
}

export function EditProfileForm({ currentProfile }: EditProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { currentUser, refreshNgoProfile } = useAuth();

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      ngoName: currentProfile.name || '',
      address: currentProfile.address || '',
      city: currentProfile.city || '',
      ngoType: currentProfile.type,
      contactPhone: currentProfile.contactPhone || '',
      website: currentProfile.website || '',
      description: currentProfile.description || '',
      operatingHours: currentProfile.operatingHours || '',
      servicesInput: currentProfile.services?.join('\n') || '',
    },
  });

  async function onSubmit(data: EditProfileFormValues) {
    if (!currentUser || !firebaseDb) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Not authenticated or Firebase not configured.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const servicesArray = data.servicesInput
            ? data.servicesInput.split('\n').map(s => s.trim()).filter(s => s)
            : [];

        const profileDataToUpdate: Partial<NGO> = {
          name: data.ngoName,
          type: data.ngoType,
          address: data.address,
          city: data.city,
          contactPhone: data.contactPhone,
          website: data.website,
          description: data.description,
          operatingHours: data.operatingHours,
          services: servicesArray,
          // contactEmail is not editable here as it's tied to login
        };
        
        const ngoDocRef = doc(firebaseDb, 'ngos', currentUser.uid);
        await updateDoc(ngoDocRef, profileDataToUpdate);

        toast({
          title: 'Profile Updated!',
          description: 'Your NGO profile has been successfully updated.',
        });
        if (refreshNgoProfile) {
            await refreshNgoProfile(); // Refresh context data
        }
      } catch (error: any) {
        console.error('Error updating NGO profile:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error.message || 'An unexpected error occurred. Please try again.',
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="ngoName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NGO Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., Hope Foundation" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ngoType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of NGO</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select NGO type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ngoTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., 123 Charity Lane" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., Mumbai" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., +91 9876543210" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., https://www.hopefoundation.org" {...field} className="pl-10" />
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
                <FormLabel>NGO Description</FormLabel>
                <FormControl>
                  <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Briefly describe your NGO's mission and activities."
                      className="resize-y min-h-[100px] pl-10"
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
            name="operatingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operating Hours (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g., Mon-Fri: 9 AM - 5 PM" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servicesInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Services Offered (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <ListChecks className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="List key services, each on a new line."
                      className="resize-y min-h-[100px] pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter each service on a new line. This will be displayed on your public profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
