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
import { Loader2, LogIn, Mail, KeyRound, Building2 } from 'lucide-react';
import React, { useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth as firebaseAuth, firebaseInitError } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const loginNgoFormSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginNgoFormValues = z.infer<typeof loginNgoFormSchema>;

export default function LoginNgoPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, userRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        if (userRole === 'ngo') {
          router.push('/ngo-dashboard');
        } else if (userRole === 'donor') {
          router.push('/donor-dashboard');
        }
      }
    }
  }, [currentUser, userRole, authLoading, router]);

  const form = useForm<LoginNgoFormValues>({
    resolver: zodResolver(loginNgoFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginNgoFormValues) {
    if (firebaseInitError || !firebaseAuth) {
      toast({
        variant: 'destructive',
        title: 'Firebase Configuration Error',
        description: firebaseInitError?.message || 'Firebase is not configured correctly. Please check the setup and .env.local file.',
        duration: 10000,
      });
      return;
    }

    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(firebaseAuth, data.email, data.password);
        toast({
          title: 'Login Successful!',
          description: 'Welcome back to MediShare.',
        });
        form.reset();
        router.push('/ngo-dashboard');
      } catch (error: any) {
        console.error('Error logging in NGO:', error);
        let description = 'Invalid email or password. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'Incorrect email or password.';
        } else {
          description = error.message || 'An unexpected error occurred.';
        }
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: description,
        });
      }
    });
  }

  if (authLoading || currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] animate-fade-in py-6 md:py-8">
      <Card className="w-full max-w-md shadow-xl mx-4 sm:mx-auto">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3 md:mb-4 mx-auto w-fit">
            <Building2 className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline text-primary">NGO Login</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Access your MediShare dashboard to manage donations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="your.ngo@example.org" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <Button type="submit" className="w-full text-md md:text-lg py-3 md:py-6 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </Form>
          <p className="mt-4 md:mt-6 text-center text-xs md:text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register-ngo" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
