
'use client';

import Image from 'next/image';
import type { NGO } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building, Mail, Phone, Users, ShieldCheck, Globe, AlertTriangle, PawPrint } from 'lucide-react';
import React, { useState } from 'react';
import { SendOfferDialog } from './SendOfferDialog';
import { Badge } from '@/components/ui/badge';

interface NgoCardProps {
  ngo: NGO;
}

export function NgoCard({ ngo }: NgoCardProps) {
  const [isSendOfferDialogOpen, setIsSendOfferDialogOpen] = useState(false);

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


  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-up">
        <div className="relative w-full h-48">
          <Image
            src={ngo.imageUrl || "https://placehold.co/600x400.png"}
            alt={`${ngo.name} activity or premises`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={ngo['data-ai-hint'] || "charity organization"}
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
            {getIconForType(ngo.type)}
            {ngo.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            <Badge variant="secondary" className="mt-1">{ngo.type}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 pt-2 pb-4">
          <div className="flex items-start gap-2 text-sm text-foreground/80">
            <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <span>{ngo.address}, {ngo.city}</span>
          </div>
          <p className="text-sm text-foreground/80 line-clamp-3">
            {ngo.description}
          </p>
           {ngo.services && ngo.services.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1">Key Services:</h4>
              <div className="flex flex-wrap gap-1.5">
                {ngo.services.slice(0,3).map(service => (
                  <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
                ))}
                {ngo.services.length > 3 && <Badge variant="outline" className="text-xs">+{ngo.services.length - 3} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-auto border-t pt-4">
          <Button onClick={() => setIsSendOfferDialogOpen(true)} className="w-full bg-accent hover:bg-accent/90">
            <Mail className="mr-2 h-4 w-4" /> Send Offer / View Contact
          </Button>
        </CardFooter>
      </Card>
      <SendOfferDialog
        ngo={ngo}
        isOpen={isSendOfferDialogOpen}
        onOpenChange={setIsSendOfferDialogOpen}
      />
    </>
  );
}
