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
import React, { useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth as firebaseAuth, db as firebaseDb, firebaseInitError } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { Donor } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { GoogleIcon } from '@/components/GoogleIcon';

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
  const { currentUser, userRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        if (userRole === 'donor') {
          router.push('/donor-dashboard');
        } else if (userRole === 'ngo') {
          router.push('/ngo-dashboard');
        }
      }
    }
  }, [currentUser, userRole, authLoading, router]);

  const form = useForm<RegisterDonorFormValues>({
    resolver: zodResolver(registerDonorFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function handleGoogleSignIn() {
    if (firebaseInitError || !firebaseAuth || !firebaseDb) {
      toast({ variant: 'destructive', title: 'Firebase Configuration Error', description: firebaseInitError?.message || 'Firebase is not configured correctly.', duration: 10000 });
      return;
    }
    const provider = new GoogleAuthProvider();
    startTransition(async () => {
      try {
        const result = await signInWithPopup(firebaseAuth, provider);
        const user = result.user;
        const donorDocRef = doc(firebaseDb, 'donors', user.uid);
        const donorDocSnap = await getDoc(donorDocRef);

        if (!donorDocSnap.exists()) {
          const newDonorProfile = {
            uid: user.uid,
            name: user.displayName || 'Anonymous Donor',
            email: user.email,
            role: 'donor' as const,
            createdAt: serverTimestamp(),
          };
          await setDoc(donorDocRef, newDonorProfile);
          toast({ title: 'Welcome!', description: 'Your new donor account has been created with Google.' });
        } else {
          toast({ title: 'Login Successful!', description: `Welcome back, ${user.displayName || 'Donor'}!` });
        }
        router.push('/donor-dashboard');
      } catch (error: any) {
        console.error('Error with Google Sign-In:', error);
        let description = 'Could not sign in with Google. Please try again.';
        if (error.code === 'auth/account-exists-with-different-credential') {
          description = 'An account already exists with this email. Please sign in with your original method.';
        } else if (error.code) {
          description = error.message;
        }
        toast({ variant: 'destructive', title: 'Sign-In Failed', description: description });
      }
    });
  }

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

  if (authLoading || currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-6 md:py-8 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl mx-4 sm:mx-auto">
        <CardHeader className="text-center">
           <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-3 md:mb-4 mx-auto w-fit">
            <UserPlus2 className="h-8 w-8 md:h-10 md:w-10 text-accent" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-accent">Donor Registration</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Create your MediShare account to help NGOs in need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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

              <Button type="submit" className="w-full text-md md:text-lg py-3 md:py-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus2 className="mr-2 h-5 w-5" />
                    Register with Email
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full py-3 md:py-6" onClick={handleGoogleSignIn} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                <GoogleIcon className="mr-3 h-5 w-5" />
                Sign up with Google
              </>
            )}
          </Button>

           <p className="mt-4 md:mt-6 text-center text-xs md:text-sm text-muted-foreground">
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
