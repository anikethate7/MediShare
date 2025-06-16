
'use client';

import type { SuggestNgosOutput } from '@/ai/flows/suggest-ngos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, ListChecks } from 'lucide-react';

interface SuggestedNgosDisplayProps {
  suggestions: SuggestNgosOutput | null;
  isLoading: boolean;
}

export function SuggestedNgosDisplay({ suggestions, isLoading }: SuggestedNgosDisplayProps) {
  if (isLoading) {
    // This loading state is handled by the form's button, so we might not need a separate loading display here.
    // Or, we can show a subtle loading indicator for the results area.
    return null;
  }

  if (!suggestions) {
    return null; // No suggestions to display or initial state
  }
  
  if (suggestions.suggestedNgos.length === 0) {
    return (
      <Card className="mt-8 animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline text-primary">
            <AlertCircle className="h-6 w-6 text-destructive" />
            No Specific NGOs Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80">
            Our AI couldn't pinpoint specific NGOs based on your input. However, many general welfare or local health clinics might still accept your donation.
            We recommend browsing all NGOs or contacting local health services.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 animate-fade-in shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline text-primary">
          <ListChecks className="h-6 w-6 text-accent" />
          Suggested NGOs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {suggestions.suggestedNgos.map((ngoName, index) => (
            <li key={index} className="p-3 bg-primary/5 border border-primary/20 rounded-md flex items-center gap-2 transition-colors hover:bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
              <span className="text-foreground/90">{ngoName}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          These are AI-generated suggestions. Please verify their current needs and donation policies before proceeding.
        </p>
      </CardContent>
    </Card>
  );
}
