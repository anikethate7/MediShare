
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus2, Mail, KeyRound, User } from 'lucide-react';
import React, { useTransition } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth as firebaseAuth, db as firebaseDb, firebaseInitError } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { Donor } from '@/types';

const registerDonorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name must not exceed 50 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterDonorFormValues = z.infer<typeof registerDonorFormSchema>;

export default function RegisterDonorPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegisterDonorFormValues>({
    resolver: zodResolver(registerDonorFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: RegisterDonorFormValues) {
    if (firebaseInitError || !firebaseAuth || !firebaseDb) {
      toast({
        variant: 'destructive',
        title: 'Firebase Configuration Error',
        description: firebaseInitError?.message || 'Firebase is not configured correctly.',
        duration: 10000,
      });
      return;
    }

    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
        const user = userCredential.user;

        if (user) {
          const donorData: Omit<Donor, 'id'> = { 
            uid: user.uid,
            name: data.name,
            email: data.email,
            role: 'donor',
            createdAt: serverTimestamp(),
          };
          
          await setDoc(doc(firebaseDb, 'donors', user.uid), donorData);

          toast({
            title: 'Registration Successful!',
            description: 'Your donor account has been created. Please login.',
          });
          form.reset();
          router.push('/login-donor'); 
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
        console.error('Error registering Donor:', error);
        let title = 'Registration Failed';
        let description = 'An unexpected error occurred. Please try again.';

        if (error.code === 'auth/email-already-in-use') {
          description = 'This email address is already in use. Please use a different email or login.';
        } else if (error.code === 'auth/weak-password') {
          description = 'The password is too weak. Please choose a stronger password.';
        } else if (error.code === 'auth/configuration-not-found') {
          title = 'Firebase Configuration Issue';
          description = 'Registration failed. Check Email/Password sign-in in Firebase & .env file.';
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
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-8 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4 mx-auto w-fit">
            <UserPlus2 className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="text-3xl font-headline text-accent">Donor Registration</CardTitle>
          <CardDescription>
            Create your MediShare account to help NGOs in need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., Jane Doe" {...field} className="pl-10" />
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
                        <Input type="email" placeholder="your.email@example.com" {...field} className="pl-10" />
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

              <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus2 className="mr-2 h-5 w-5" />
                    Register as Donor
                  </>
                )}
              </Button>
            </form>
          </Form>
           <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login-donor" className="font-medium text-accent hover:underline">
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
