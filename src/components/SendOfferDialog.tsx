'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { NGO } from '@/types';
import { Mail, Phone, Copy, ExternalLink, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SendOfferDialogProps {
  ngo: NGO | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SendOfferDialog({ ngo, isOpen, onOpenChange }: SendOfferDialogProps) {
  const { toast } = useToast();

  if (!ngo) return null;

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${type} Copied!`,
        description: `${text} copied to clipboard.`,
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: `Could not copy ${type}. Please try manually.`,
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card rounded-lg shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Building className="h-6 w-6 text-accent" />
            Contact {ngo.name}
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            You can reach out to {ngo.name} using the contact details below to offer your medicine donation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {ngo.contactEmail && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <a href={`mailto:${ngo.contactEmail}`} className="text-primary hover:underline truncate" title={ngo.contactEmail}>
                  {ngo.contactEmail}
                </a>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(ngo.contactEmail!, 'Email')} aria-label="Copy email">
                <Copy className="h-4 w-4 text-muted-foreground hover:text-accent" />
              </Button>
            </div>
          )}
          {ngo.contactPhone && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
               <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-foreground truncate" title={ngo.contactPhone}>{ngo.contactPhone}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(ngo.contactPhone!, 'Phone number')} aria-label="Copy phone number">
                <Copy className="h-4 w-4 text-muted-foreground hover:text-accent" />
              </Button>
            </div>
          )}
          {ngo.website && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-accent" />
                 <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate" title={ngo.website}>
                  Visit Website
                </a>
              </div>
            </div>
          )}
          {!ngo.contactEmail && !ngo.contactPhone && (
            <p className="text-muted-foreground text-center">No direct contact information available. Please check their website if available.</p>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
