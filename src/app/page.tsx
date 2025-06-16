'use client';

import { useState } from 'react';
import { NgoSuggestionForm } from '@/components/NgoSuggestionForm';
import { SuggestedNgosDisplay } from '@/components/SuggestedNgosDisplay';
import type { SuggestNgosOutput } from '@/ai/flows/suggest-ngos';
import { HeroSection } from '@/components/HeroSection';

export default function HomePage() {
  const [suggestedNgos, setSuggestedNgos] = useState<SuggestNgosOutput | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleSuggestionsReady = (suggestions: SuggestNgosOutput | null) => {
    setSuggestedNgos(suggestions);
    setIsLoadingSuggestions(false); // Handled by form's pending state for button
  };

  return (
    <div className="space-y-12">
      <HeroSection />
      <NgoSuggestionForm onSuggestionsReady={handleSuggestionsReady} />
      <SuggestedNgosDisplay suggestions={suggestedNgos} isLoading={isLoadingSuggestions} />
    </div>
  );
}
