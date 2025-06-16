import Link from 'next/link';
import { HeartPulse, Search, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <HeartPulse className="h-8 w-8 text-accent" />
          <h1 className="text-2xl font-headline font-bold">MediShare</h1>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-1.5 text-sm sm:text-base">
              <Lightbulb className="h-4 w-4 text-accent" />
              Suggest NGOs
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/browse-ngos" className="flex items-center gap-1.5 text-sm sm:text-base">
              <Search className="h-4 w-4 text-accent" />
              Browse NGOs
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
