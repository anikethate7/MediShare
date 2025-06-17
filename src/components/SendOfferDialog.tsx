
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
import { Mail, Phone, Copy, ExternalLink, Building2, MessageSquarePlus, Loader2, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { generateOfferMessage } from '@/ai/flows/generate-offer-message-flow';

interface SendOfferDialogProps {
  ngo: NGO | null;
  requestedMedicineName?: string; // Added to pass the medicine name
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SendOfferDialog({ ngo, requestedMedicineName, isOpen, onOpenChange }: SendOfferDialogProps) {
  const { toast } = useToast();
  const [messageDraft, setMessageDraft] = useState('');
  const [isGenerating, startGenerateTransition] = useTransition();

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

  const handleGenerateMessage = () => {
    if (!requestedMedicineName) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Medicine name not available for message generation.',
      });
      return;
    }
    startGenerateTransition(async () => {
      try {
        const result = await generateOfferMessage({
          ngoName: ngo.name,
          requestedMedicineName: requestedMedicineName,
        });
        if (result.messageDraft) {
          setMessageDraft(result.messageDraft);
          toast({
            title: 'Message Draft Generated!',
            description: 'You can edit the draft below or copy it.',
          });
        } else {
          throw new Error('Empty draft received from AI.');
        }
      } catch (error) {
        console.error('Error generating message draft:', error);
        toast({
          variant: 'destructive',
          title: 'Draft Generation Failed',
          description: 'Could not generate a message draft. Please try again or write your own.',
        });
        setMessageDraft('Sorry, I could not generate a draft. Please write your own message.');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setMessageDraft(''); // Clear draft on close
    }}>
      <DialogContent className="sm:max-w-md bg-card rounded-lg shadow-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> 
            Contact {ngo.name}
          </DialogTitle>
          <DialogDescription className="text-foreground/80">
            Reach out to {ngo.name} using these details to offer your medicine donation for {requestedMedicineName || 'their needs'}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-3 border-b border-border">
          {ngo.contactEmail && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-md">
              <div className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 text-accent" />
                <a href={`mailto:${ngo.contactEmail}`} className="text-sm text-primary hover:underline truncate" title={ngo.contactEmail}>
                  {ngo.contactEmail}
                </a>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(ngo.contactEmail!, 'Email')} aria-label="Copy email">
                <Copy className="h-4 w-4 text-muted-foreground hover:text-accent" />
              </Button>
            </div>
          )}
          {ngo.contactPhone && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-md">
               <div className="flex items-center gap-2.5">
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-sm text-foreground truncate" title={ngo.contactPhone}>{ngo.contactPhone}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(ngo.contactPhone!, 'Phone number')} aria-label="Copy phone number">
                <Copy className="h-4 w-4 text-muted-foreground hover:text-accent" />
              </Button>
            </div>
          )}
          {ngo.website && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-md">
              <div className="flex items-center gap-2.5">
                <ExternalLink className="h-5 w-5 text-accent" />
                 <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate" title={ngo.website}>
                  Visit Website
                </a>
              </div>
            </div>
          )}
          {!ngo.contactEmail && !ngo.contactPhone && !ngo.website && (
            <p className="text-sm text-muted-foreground text-center p-3 bg-muted/30 rounded-md">Contact information not available for this NGO.</p>
          )}
        </div>

        {requestedMedicineName && (
          <div className="space-y-3 py-3">
            <h4 className="text-sm font-medium text-foreground/90 flex items-center gap-1.5">
              <Edit3 className="h-4 w-4 text-accent" />
              Need help writing your message?
            </h4>
            <Button onClick={handleGenerateMessage} disabled={isGenerating} variant="outline" className="w-full text-accent border-accent hover:bg-accent/10">
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><MessageSquarePlus className="mr-2 h-4 w-4" /> Generate Polite Message Draft</>
              )}
            </Button>
            {isGenerating && !messageDraft && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Thinking...
              </div>
            )}
            {messageDraft && (
              <div className="space-y-2 mt-2">
                <Textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder="Your message draft will appear here."
                  rows={8}
                  className="text-sm"
                />
                <Button onClick={() => handleCopyToClipboard(messageDraft, 'Message Draft')} variant="secondary" size="sm" className="w-full">
                  <Copy className="mr-2 h-4 w-4" /> Copy Draft
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
