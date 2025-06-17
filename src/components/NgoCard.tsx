
'use client';

import Image from 'next/image';
import type { NGO } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building, Mail, Users, ShieldCheck, AlertTriangle, PawPrint, Loader2 } from 'lucide-react'; // Removed Globe
import React, { useState } from 'react';
import { SendOfferDialog } from './SendOfferDialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase/config';


interface NgoCardProps {
  ngo: NGO; // Expecting full NGO object initially from mock data or a list fetch
}

export function NgoCard({ ngo: initialNgoData }: NgoCardProps) {
  const [isSendOfferDialogOpen, setIsSendOfferDialogOpen] = useState(false);
  // Store potentially fetched full NGO details if needed, though initialNgoData should be complete from mock
  const [currentNgoDetails, setCurrentNgoDetails] = useState<NGO>(initialNgoData);
  const [isLoadingNgoDetails, setIsLoadingNgoDetails] = useState(false);
  const { toast } = useToast();

  const getIconForType = (type: NGO['type']) => {
    switch (type) {
      case 'Medical Facility': return <ShieldCheck className="h-5 w-5 text-accent" />;
      case 'Community Health': return <Users className="h-5 w-5 text-accent" />;
      case 'Disaster Relief': return <AlertTriangle className="h-5 w-5 text-accent" />;
      case 'General Welfare': return <Building className="h-5 w-5 text-accent" />;
      case 'Animal Welfare': return <PawPrint className="h-5 w-5 text-accent" />;
      default: return <Building className="h-5 w-5 text-accent" />;
    }
  };

  const handleViewContact = async () => {
    // If we already have contact details (email or phone), or if it's mock data without full Firestore interaction for this view
    // we can open the dialog directly.
    // For a live environment where `initialNgoData` might be a summary,
    // we might need to fetch full details. Assuming `initialNgoData` is sufficient from `mockNgos` or a complete fetch.
    
    // If initialNgoData.uid exists and we might need to refresh or get more details:
    if (initialNgoData.uid && firebaseDb && (!initialNgoData.contactEmail && !initialNgoData.contactPhone)) {
        setIsLoadingNgoDetails(true);
        try {
            const ngoDocRef = doc(firebaseDb, 'ngos', initialNgoData.uid);
            const docSnap = await getDoc(ngoDocRef);
            if (docSnap.exists()) {
                setCurrentNgoDetails({ uid: docSnap.id, ...docSnap.data() } as NGO);
                setIsSendOfferDialogOpen(true);
            } else {
                toast({ title: "NGO details not found", variant: "destructive" });
                // Fallback to initial data if any
                setCurrentNgoDetails(initialNgoData);
                setIsSendOfferDialogOpen(true);
            }
        } catch (error) {
            console.error("Error fetching NGO details:", error);
            toast({ title: "Error fetching NGO details", variant: "destructive" });
            // Fallback to initial data if any
            setCurrentNgoDetails(initialNgoData);
            setIsSendOfferDialogOpen(true); // Still open with whatever data we have
        } finally {
            setIsLoadingNgoDetails(false);
        }
    } else {
        // If no UID (pure mock) or already has contact info, or Firebase not configured for this path
        setCurrentNgoDetails(initialNgoData); // Ensure currentNgoDetails is set
        setIsSendOfferDialogOpen(true);
    }
  };


  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-up">
        <div className="relative w-full h-48">
          <Image
            src={currentNgoDetails.imageUrl || "https://placehold.co/600x400.png"}
            alt={`${currentNgoDetails.name} activity or premises`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={currentNgoDetails['data-ai-hint'] || "charity organization"}
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
            {getIconForType(currentNgoDetails.type)}
            {currentNgoDetails.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            <Badge variant="secondary" className="mt-1">{currentNgoDetails.type}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 pt-2 pb-4">
          <div className="flex items-start gap-2 text-sm text-foreground/80">
            <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <span>{currentNgoDetails.address}, {currentNgoDetails.city}</span>
          </div>
          <p className="text-sm text-foreground/80 line-clamp-3">
            {currentNgoDetails.description}
          </p>
           {currentNgoDetails.services && currentNgoDetails.services.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1">Key Services:</h4>
              <div className="flex flex-wrap gap-1.5">
                {currentNgoDetails.services.slice(0,3).map(service => (
                  <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
                ))}
                {currentNgoDetails.services.length > 3 && <Badge variant="outline" className="text-xs">+{currentNgoDetails.services.length - 3} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto border-t pt-4">
          <Button onClick={handleViewContact} className="w-full bg-accent hover:bg-accent/90" disabled={isLoadingNgoDetails}>
            {isLoadingNgoDetails ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</>
            ) : (
              <><Mail className="mr-2 h-4 w-4" /> Send Offer / View Contact</>
            )}
          </Button>
        </CardFooter>
      </Card>
      {currentNgoDetails && ( // Ensure currentNgoDetails is not null before rendering dialog
         <SendOfferDialog
            ngo={currentNgoDetails}
            isOpen={isSendOfferDialogOpen}
            onOpenChange={setIsSendOfferDialogOpen}
          />
      )}
    </>
  );
}
