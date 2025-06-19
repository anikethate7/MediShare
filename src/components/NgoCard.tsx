
'use client';

import Image from 'next/image';
import type { NGO } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building, Users, ShieldCheck, AlertTriangle, PawPrint, Loader2, Mail, Briefcase } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { SendOfferDialog } from './SendOfferDialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase/config';


interface NgoCardProps {
  ngo: NGO;
}

const NgoCardComponent = ({ ngo: initialNgoData }: NgoCardProps) => {
  const [isSendOfferDialogOpen, setIsSendOfferDialogOpen] = useState(false);
  const [currentNgoDetails, setCurrentNgoDetails] = useState<NGO>(initialNgoData);
  const [isLoadingNgoDetails, setIsLoadingNgoDetails] = useState(false);
  const { toast } = useToast();

  const getIconForType = (type: NGO['type']) => {
    switch (type) {
      case 'Medical Facility': return <ShieldCheck className="h-5 w-5 text-primary" />;
      case 'Community Health': return <Users className="h-5 w-5 text-primary" />;
      case 'Disaster Relief': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'General Welfare': return <Building className="h-5 w-5 text-primary" />;
      case 'Animal Welfare': return <PawPrint className="h-5 w-5 text-green-600" />;
      default: return <Building className="h-5 w-5 text-primary" />;
    }
  };

  const handleViewContact = useCallback(async () => {
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
                setCurrentNgoDetails(initialNgoData);
                setIsSendOfferDialogOpen(true);
            }
        } catch (error) {
            console.error("Error fetching NGO details:", error);
            toast({ title: "Error fetching NGO details", variant: "destructive" });
            setCurrentNgoDetails(initialNgoData);
            setIsSendOfferDialogOpen(true);
        } finally {
            setIsLoadingNgoDetails(false);
        }
    } else {
        setCurrentNgoDetails(initialNgoData);
        setIsSendOfferDialogOpen(true);
    }
  }, [initialNgoData, toast]);


  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-up group">
        <div className="relative w-full h-32 sm:h-40">
          <Image
            src={currentNgoDetails.imageUrl || "https://placehold.co/600x400.png"}
            alt={`${currentNgoDetails.name} activity or premises`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={currentNgoDetails['data-ai-hint'] || "charity organization"}
            className="group-hover:scale-105 transition-transform duration-300"
            priority={false}
            loading="lazy"
          />
        </div>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-lg md:text-xl font-headline text-primary flex items-center gap-2">
            {getIconForType(currentNgoDetails.type)}
            {currentNgoDetails.name}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground pt-1">
            <Badge variant="outline" className="mt-1 border-primary/50 text-primary">{currentNgoDetails.type}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 md:space-y-3 pt-2 pb-3 md:pb-4">
          <div className="flex items-start gap-2 text-xs md:text-sm text-foreground/80">
            <MapPin className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <span>{currentNgoDetails.address}, {currentNgoDetails.city}</span>
          </div>
          <p className="text-xs md:text-sm text-foreground/90 line-clamp-3">
            {currentNgoDetails.description}
          </p>
           {currentNgoDetails.services && currentNgoDetails.services.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1 md:mb-1.5 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-accent" />
                Key Services:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentNgoDetails.services.slice(0,3).map(service => (
                  <Badge key={service} variant="secondary" className="text-xs">{service}</Badge>
                ))}
                {currentNgoDetails.services.length > 3 && <Badge variant="secondary" className="text-xs">+{currentNgoDetails.services.length - 3} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto border-t pt-3 md:pt-4 pb-3 md:pb-4">
          <Button onClick={handleViewContact} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-2.5 md:text-base md:py-3" disabled={isLoadingNgoDetails}>
            {isLoadingNgoDetails ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...</>
            ) : (
              <><Mail className="mr-2 h-4 w-4" /> Send Offer / View Contact</>
            )}
          </Button>
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

export const NgoCard = React.memo(NgoCardComponent);
