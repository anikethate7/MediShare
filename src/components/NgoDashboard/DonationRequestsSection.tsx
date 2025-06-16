
'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CreateDonationRequestForm } from './CreateDonationRequestForm';
import { ViewDonationRequests } from './ViewDonationRequests';
import { useAuth } from '@/context/AuthContext';
import type { DonationRequest } from '@/types';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Inbox, PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function DonationRequestsSection() {
  const { currentUser, ngoProfile } = useAuth();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdatingStatus, startUpdateTransition] = useTransition();
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    if (!currentUser || !firebaseDb) return;
    setIsLoadingRequests(true);
    try {
      const requestsQuery = query(
        collection(firebaseDb, 'donationRequests'),
        where('ngoUid', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(requestsQuery);
      const fetchedRequests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as DonationRequest[];
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching donation requests:', error);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Requests',
        description: 'Could not load your donation requests. Please try again.',
      });
    } finally {
      setIsLoadingRequests(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequestCreated = () => {
    setIsCreateDialogOpen(false);
    fetchRequests(); // Refresh the list
  };

  const handleUpdateStatus = async (requestId: string, newStatus: DonationRequest['status']) => {
    if (!firebaseDb) return;
    startUpdateTransition(async () => {
      try {
        const requestDocRef = doc(firebaseDb, 'donationRequests', requestId);
        await updateDoc(requestDocRef, {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
        toast({
          title: 'Status Updated',
          description: `Request status changed to ${newStatus}.`,
        });
        fetchRequests(); // Refresh the list
      } catch (error) {
        console.error('Error updating request status:', error);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update the request status.',
        });
      }
    });
  };

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-6 w-6 text-accent" />
            Medicine Donation Requests
          </CardTitle>
          <CardDescription>
            Manage your NGO&apos;s specific medicine needs here.
          </CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Request
            </Button>
          </DialogTrigger>
          {ngoProfile && currentUser && (
            <CreateDonationRequestForm
              ngoUid={currentUser.uid}
              ngoName={ngoProfile.name}
              onSuccess={handleRequestCreated}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          )}
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoadingRequests ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading requests...</p>
          </div>
        ) : (
          <ViewDonationRequests
            requests={requests}
            onUpdateStatus={handleUpdateStatus}
            isUpdatingStatus={isUpdatingStatus}
          />
        )}
      </CardContent>
    </Card>
  );
}
