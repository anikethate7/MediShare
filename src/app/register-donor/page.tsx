
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterDonorPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] animate-fade-in">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
           <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-4 mx-auto w-fit">
            <UserPlus2 className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="text-3xl font-headline text-accent">Donor Registration</CardTitle>
          <CardDescription>
            Join MediShare as a donor. This feature is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            We are working on bringing you a seamless donor registration experience.
            Please check back later.
          </p>
          <Button asChild variant="outline">
            <Link href="/login-donor">Back to Donor Login</Link>
          </Button>
           <p className="mt-6 text-sm text-muted-foreground">
            Are you an NGO?{' '}
            <Link href="/register-ngo" className="font-medium text-primary hover:underline">
              Register your NGO here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
