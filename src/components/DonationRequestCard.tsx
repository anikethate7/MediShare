
'use client';

import React, { useState, useCallback } from 'react';
import type { DonationRequest, NGO } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Thermometer, CalendarDays, Building, Send, Loader2, Info, HelpCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SendOfferDialog } from './SendOfferDialog';
import { useToast } from '@/hooks/use-toast';

interface DonationRequestCardProps {
  request: DonationRequest;
  ngo: NGO | null;
  fetchNgoDetails: (ngoUid: string) => Promise<NGO | null>;
}

const DonationRequestCardComponent = ({ request, ngo: initialNgo, fetchNgoDetails }: DonationRequestCardProps) => {
  const [isSendOfferDialogOpen, setIsSendOfferDialogOpen] = useState(false);
  const [currentNgoDetails, setCurrentNgoDetails] = useState<NGO | null>(initialNgo);
  const [isLoadingNgo, setIsLoadingNgo] = useState(false);
  const { toast } = useToast();

  const handleOfferHelp = useCallback(async () => {
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
  }, [currentNgoDetails, fetchNgoDetails, request.ngoUid, toast]);

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
      <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-up group">
        <CardHeader className="pb-2 pt-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg md:text-xl font-headline text-primary flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              {request.medicineName}
            </CardTitle>
            <Badge variant={getUrgencyBadgeVariant(request.urgency)} className="ml-2 shrink-0 text-xs px-2 py-0.5">
              <Thermometer className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />{request.urgency}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground pt-1 flex items-center">
            <Building className="h-4 w-4 mr-1.5 text-muted-foreground" />
            Requested by: {request.ngoName}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 md:space-y-3 pt-0 pb-3 md:pb-4">
          <p className="text-sm text-foreground/90 line-clamp-3 flex items-start gap-2">
            <Info className="h-4 w-4 mr-0 text-accent flex-shrink-0 mt-0.5" />
            <span>{request.description}</span>
          </p>
          <div className="text-sm text-foreground/90 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-accent flex-shrink-0" />
            <strong>Quantity Needed:</strong> {request.quantityNeeded}
          </div>
          {request.notes && (
            <p className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded-md">
              <strong>Notes:</strong> {request.notes}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-auto border-t pt-3 pb-3 flex flex-col items-start space-y-1.5">
          <Button onClick={handleOfferHelp} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-2.5 md:text-base md:py-3" disabled={isLoadingNgo}>
            {isLoadingNgo ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Contact...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Offer Help / Contact NGO</>
            )}
          </Button>
          <div className="text-xs text-muted-foreground self-end flex items-center gap-1">
            <CalendarDays className="h-4 w-4" /> Posted {timeAgo}
          </div>
        </CardFooter>
      </Card>
      {currentNgoDetails && (
        <SendOfferDialog
          ngo={currentNgoDetails}
          requestedMedicineName={request.medicineName}
          isOpen={isSendOfferDialogOpen}
          onOpenChange={setIsSendOfferDialogOpen}
        />
      )}
    </>
  );
}

export const DonationRequestCard = React.memo(DonationRequestCardComponent);
