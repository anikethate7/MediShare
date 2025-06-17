
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
import { Loader2, LogIn, Mail, KeyRound, UserCircle } from 'lucide-react';
import React, { useTransition } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth as firebaseAuth, firebaseInitError } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const loginDonorFormSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginDonorFormValues = z.infer<typeof loginDonorFormSchema>;

export default function LoginDonorPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginDonorFormValues>({
    resolver: zodResolver(loginDonorFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginDonorFormValues) {
    if (firebaseInitError || !firebaseAuth) {
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
        await signInWithEmailAndPassword(firebaseAuth, data.email, data.password);
        toast({
          title: 'Login Successful!',
          description: 'Welcome back to MediShare.',
        });
        form.reset();
        router.push('/donor-dashboard'); // Redirect to Donor Dashboard
      } catch (error: any) {
        console.error('Error logging in Donor:', error);
        let description = 'Invalid email or password. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = 'Incorrect email or password.';
        } else if (error.code === 'auth/configuration-not-found') {
          description = 'Authentication system not configured. Please contact support.';
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

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] animate-fade-in">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4 mx-auto w-fit">
            <UserCircle className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="text-3xl font-headline text-accent">Donor Login</CardTitle>
          <CardDescription>
            Access your MediShare dashboard to view requests and manage your activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90" disabled={isPending}>
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
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register-donor" className="font-medium text-accent hover:underline">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
