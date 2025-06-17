
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { EditProfileForm } from '@/components/NgoDashboard/EditProfileForm';
import { DonationRequestsSection } from '@/components/NgoDashboard/DonationRequestsSection';

export default function NgoDashboardPage() {
  const { currentUser, userRole, ngoProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/login-ngo');
      } else if (userRole === 'donor') {
        router.push('/donor-dashboard');
      }
    }
  }, [currentUser, userRole, loading, router]);

  if (loading || (!currentUser && userRole !== 'ngo')) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!ngoProfile && userRole === 'ngo') { // Only show "Profile Not Found" if they are identified as an NGO but profile is missing
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive mb-2">NGO Profile Error</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t load your NGO profile details. Please try logging out and back in.
          If the issue persists, contact support.
        </p>
      </div>
    );
  }
  
  // If not an NGO (e.g. role is null or donor, though donor should be redirected)
  if (userRole !== 'ngo') {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          This dashboard is for registered NGOs only.
        </p>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-fade-in">
      <section className="text-center">
         <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 mx-auto w-fit">
          <LayoutDashboard className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold mb-2 text-primary">
          NGO Dashboard
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Welcome, {ngoProfile.name}! Manage your profile and donation activities here.
        </p>
      </section>

      <Tabs defaultValue="donation-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:max-w-sm mx-auto">
          <TabsTrigger value="donation-requests">Donation Requests</TabsTrigger>
          <TabsTrigger value="edit-profile">Edit Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="donation-requests">
          <DonationRequestsSection />
        </TabsContent>
        <TabsContent value="edit-profile">
          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle>Edit Your NGO Profile</CardTitle>
              <CardDescription>
                Keep your information up-to-date for donors.
              </CardDescription>
            </CardHeader>
            <EditProfileForm currentProfile={ngoProfile} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
