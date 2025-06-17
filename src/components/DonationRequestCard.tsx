
'use client';

import React, { useState } from 'react';
import type { DonationRequest, NGO } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Thermometer, CalendarDays, Building, Send, Loader2, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SendOfferDialog } from './SendOfferDialog';
import { useToast } from '@/hooks/use-toast';

interface DonationRequestCardProps {
  request: DonationRequest;
  ngo: NGO | null; // NGO details can be passed if already fetched
  fetchNgoDetails: (ngoUid: string) => Promise<NGO | null>; // Function to fetch NGO details
}

export function DonationRequestCard({ request, ngo: initialNgo, fetchNgoDetails }: DonationRequestCardProps) {
  const [isSendOfferDialogOpen, setIsSendOfferDialogOpen] = useState(false);
  const [currentNgoDetails, setCurrentNgoDetails] = useState<NGO | null>(initialNgo);
  const [isLoadingNgo, setIsLoadingNgo] = useState(false);
  const { toast } = useToast();

  const handleOfferHelp = async () => {
    if (currentNgoDetails) {
      setIsSendOfferDialogOpen(true);
      return;
    }

    setIsLoadingNgo(true);
    try {
      const fetchedNgo = await fetchNgoDetails(request.ngoUid);
      if (fetchedNgo) {
        setCurrentNgoDetails(fetchedNgo);
        setIsSendOfferDialogOpen(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load NGO contact details. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error fetching NGO details for dialog:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load NGO contact details. Please try again.',
      });
    } finally {
      setIsLoadingNgo(false);
    }
  };

  const getUrgencyBadgeVariant = (urgency: DonationRequest['urgency']) => {
    switch (urgency) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  const timeAgo = request.createdAt ? formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true }) : 'N/A';

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-up">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
              <Pill className="h-5 w-5 text-accent" />
              {request.medicineName}
            </CardTitle>
            <Badge variant={getUrgencyBadgeVariant(request.urgency)} className="ml-2 shrink-0">
              <Thermometer className="h-3 w-3 mr-1" />{request.urgency}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground pt-1">
            <Building className="inline-block h-3.5 w-3.5 mr-1 text-accent" />
            Requested by: {request.ngoName}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 pt-0 pb-4">
          <p className="text-sm text-foreground/80 line-clamp-3">
            <Info className="inline-block h-4 w-4 mr-1.5 text-accent relative -top-0.5" />
            {request.description}
          </p>
          <div className="text-sm text-foreground/80">
            <strong>Quantity Needed:</strong> {request.quantityNeeded}
          </div>
          {request.notes && (
            <p className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded-md">
              <strong>Notes:</strong> {request.notes}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-auto border-t pt-3 pb-3 flex flex-col items-start space-y-2">
          <Button onClick={handleOfferHelp} className="w-full bg-accent hover:bg-accent/90" disabled={isLoadingNgo}>
            {isLoadingNgo ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Contact...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Offer Help / Contact NGO</>
            )}
          </Button>
          <div className="text-xs text-muted-foreground self-end flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> Posted {timeAgo}
          </div>
        </CardFooter>
      </Card>
      {currentNgoDetails && (
        <SendOfferDialog
          ngo={currentNgoDetails}
          isOpen={isSendOfferDialogOpen}
          onOpenChange={setIsSendOfferDialogOpen}
        />
      )}
    </>
  );
}

