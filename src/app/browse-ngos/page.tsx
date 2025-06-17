
import { NgoListClient } from '@/components/NgoListClient';
import { SearchCode } from 'lucide-react'; // Changed Search to SearchCode for a different visual
import { mockNgos } from '@/data/mockData'; 

export default function BrowseNgosPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
          <SearchCode className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold mb-4 text-primary">
          Discover NGOs Near You
        </h1>
        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
          Find local organizations where your unused medicine can make a difference. Use the filters below to narrow down your search.
        </p>
      </section>
      
      <NgoListClient initialNgos={mockNgos} />
    </div>
  );
}

export const metadata = {
  title: 'Browse NGOs - MediShare',
  description: 'Find and connect with NGOs to donate your unused medicines.',
};
