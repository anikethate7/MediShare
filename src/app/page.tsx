
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserCircle, Building2 } from 'lucide-react';
import { HomepageImpactStoriesSection } from '@/components/HomepageImpactStoriesSection';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] py-8 md:py-12 animate-fade-in">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold mb-3 md:mb-4 text-primary">
          Welcome to MediShare
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-foreground/80 max-w-xl md:max-w-2xl mx-auto">
          Connecting those with surplus medicine to those in need. Choose your role to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-xl md:max-w-4xl">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
          <CardHeader className="text-center">
            <div className="mx-auto bg-accent/10 p-3 md:p-4 rounded-full w-fit mb-3 md:mb-4 group-hover:bg-accent/20 transition-colors">
              <UserCircle className="h-8 w-8 md:h-10 md:w-12 text-accent" />
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline text-accent">Are you a Donor?</CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-md text-foreground/70 pt-1 md:pt-2">
              Login or register to view active medicine requests from NGOs and offer your help.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-6">
              <Link href="/login-donor">
                Donor Portal <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 md:p-4 rounded-full w-fit mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-8 w-8 md:h-10 md:w-12 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline text-primary">Are you an NGO?</CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-md text-foreground/70 pt-1 md:pt-2">
              Register or log in to manage your profile and post medicine donation requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-6">
              <Link href="/login-ngo">
                NGO Portal <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <HomepageImpactStoriesSection />
    </div>
  );
}
