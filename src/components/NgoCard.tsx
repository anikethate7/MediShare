'use client';

import Image from 'next/image';
import type { NGO } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building, Mail, Phone, Users, ShieldCheck, Globe } from 'lucide-react';
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
      case 'Disaster Relief': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 12c-versorgungssicherheit-2.828 0-5-2.172-5-4.8s2.172-4.8 5-4.8 5 2.172 5 4.8-2.172 4.8-5 4.8zm0 0V21m0-9H3m9 0h9"></path><path d="M12 21a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 1 0 0 4.8z"></path><path d="M3 12a2.4 2.4 0 1 1-4.8 0 2.4 2.4 0 1 1 4.8 0z"></path><path d="M21 12a2.4 2.4 0 1 1-4.8 0 2.4 2.4 0 1 1 4.8 0z"></path></svg>; // Custom icon placeholder
      case 'General Welfare': return <Building className="h-5 w-5 text-accent" />;
      case 'Animal Welfare': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M17.5 9.5C19.433 9.5 21 7.933 21 6C21 4.067 19.433 2.5 17.5 2.5C15.567 2.5 14 4.067 14 6C14 7.933 15.567 9.5 17.5 9.5Z"></path><path d="M8.5 18.5C10.433 18.5 12 16.933 12 15C12 13.067 10.433 11.5 8.5 11.5C6.567 11.5 5 13.067 5 15C5 16.933 6.567 18.5 8.5 18.5Z"></path><path d="M14 12L10.25 17.333C10.067 17.6 9.8 17.733 9.5 17.733C8.7 17.733 8.5 16.933 8.5 16.5V11.5L14 6V12Z"></path><path d="M21 12V15C21 18.333 18.333 21 15 21H9C5.667 21 3 18.333 3 15V9C3 5.667 5.667 3 9 3H12"></path></svg>; // Custom icon placeholder
      default: return <Building className="h-5 w-5 text-accent" />;
    }
  };


  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-in-up">
        <div className="relative w-full h-48">
          <Image
            src={ngo.imageUrl || "https://placehold.co/600x400.png"}
            alt={`${ngo.name} building or activity`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="charity organization"
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
