
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Building2, Mail, KeyRound, MapPin, Phone, Globe, FileText } from 'lucide-react'; // Changed Building to Building2
import React, { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ngoTypes } from '@/data/mockData';
import type { NGO } from '@/types';
import { auth as firebaseAuth, db as firebaseDb, firebaseInitError } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const registerNgoFormSchema = z.object({
  ngoName: z.string().min(3, 'NGO name must be at least 3 characters.').max(100, 'NGO name must not exceed 100 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  city: z.string().min(2, 'City must be at least 2 characters.'),
  ngoType: z.enum(ngoTypes as [NGO['type'], ...NGO['type'][]], {
    required_error: "You need to select an NGO type.",
  }),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits.').regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number format.'),
  website: z.string().url('Invalid URL.').optional().or(z.literal('')),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(1000, 'Description must not exceed 1000 characters.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterNgoFormValues = z.infer<typeof registerNgoFormSchema>;

export default function RegisterNgoPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegisterNgoFormValues>({
    resolver: zodResolver(registerNgoFormSchema),
    defaultValues: {
      ngoName: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      city: '',
      ngoType: undefined,
      contactPhone: '',
      website: '',
      description: '',
    },
  });

  async function onSubmit(data: RegisterNgoFormValues) {
    if (firebaseInitError || !firebaseAuth || !firebaseDb) {
      toast({
        variant: 'destructive',
        title: 'Firebase Configuration Error',
        description: firebaseInitError?.message || 'Firebase is not configured correctly. Please check the setup and .env file.',
        duration: 10000,
      });
      return;
    }

    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
        const user = userCredential.user;

        if (user) {
          const ngoData: Omit<NGO, 'id' | 'imageUrl' | 'operatingHours' | 'services' | 'data-ai-hint'> & { uid: string } = {
            uid: user.uid,
            name: data.ngoName,
            type: data.ngoType,
            address: data.address,
            city: data.city,
            description: data.description,
            contactEmail: data.email, // Store email in profile as well
            contactPhone: data.contactPhone,
            website: data.website,
          };
          
          await setDoc(doc(firebaseDb, 'ngos', user.uid), ngoData);

          toast({
            title: 'Registration Successful!',
            description: 'Your NGO account has been created. Please login.',
          });
          form.reset();
          router.push('/login-ngo'); // Redirect to NGO login
        } else {
          console.error('Registration: Firebase user object is null after successful creation call.');
          toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: 'User creation seemed to succeed, but no user data was returned. Please try again.',
            duration: 10000,
          });
        }
      } catch (error: any) {
        console.error('Error registering NGO:', error);
        let title = 'Registration Failed';
        let description = 'An unexpected error occurred. Please try again.';

        if (error.code === 'auth/email-already-in-use') {
          description = 'This email address is already in use. Please use a different email or login.';
        } else if (error.code === 'auth/weak-password') {
          description = 'The password is too weak. Please choose a stronger password.';
        } else if (error.code === 'auth/configuration-not-found') {
          title = 'Firebase Configuration Issue';
          description = 'Registration failed. This usually means Email/Password sign-in is not enabled for your Firebase project, or the Project ID in your .env file is incorrect. Please check your Firebase project settings (Authentication > Sign-in method) and verify your .env file, then restart the server.';
        } else if (error.message) {
          description = error.message;
        }
        
        toast({
          variant: 'destructive',
          title: title,
          description: description,
          duration: 10000, 
        });
      }
    });
  }

  return (
    <div className="flex justify-center py-8 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 mx-auto w-fit">
            <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">Register Your NGO</CardTitle>
          <CardDescription>
            Join MediShare to connect with donors and manage your medicine needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ngoName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NGO Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., Hope Foundation" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="e.g., contact@hopefoundation.org" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="********" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                       <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="********" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., 123 Charity Lane, Helping Hand Building" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

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
                          placeholder="Briefly describe your NGO's mission, activities, and the types of medicines you typically need."
                          className="resize-y min-h-[120px] pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      This information will be visible to potential donors.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Registration...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register NGO
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
