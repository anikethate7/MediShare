
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
import { Loader2, LogIn, Mail, KeyRound } from 'lucide-react';
import React, { useTransition } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const loginNgoFormSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginNgoFormValues = z.infer<typeof loginNgoFormSchema>;

export default function LoginNgoPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginNgoFormValues>({
    resolver: zodResolver(loginNgoFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginNgoFormValues) {
    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: 'Login Successful!',
          description: 'Welcome back to MediShare.',
        });
        form.reset();
        router.push('/'); // Redirect to homepage or a dashboard page
      } catch (error: any) {
        console.error('Error logging in NGO:', error);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'Invalid email or password. Please try again.',
        });
      }
    });
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] animate-fade-in">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 mx-auto w-fit">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">NGO Login</CardTitle>
          <CardDescription>
            Access your MediShare dashboard to manage donations.
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

              <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90" disabled={isPending}>
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
            <Link href="/register-ngo" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
