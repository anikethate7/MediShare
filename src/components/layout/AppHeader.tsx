
import Link from 'next/link';
import { HeartPulse, Search, Lightbulb, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <HeartPulse className="h-8 w-8 text-accent" />
          <h1 className="text-2xl font-headline font-bold">MediShare</h1>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Lightbulb className="h-4 w-4 text-accent" />
              Suggest
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/browse-ngos" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Search className="h-4 w-4 text-accent" />
              Browse
            </Link>
          </Button>
           <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
            <Link href="/register-ngo" className="flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-accent" />
              Register NGO
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild className="text-xs sm:text-sm bg-accent hover:bg-accent/90">
            <Link href="/login-ngo" className="flex items-center gap-1.5">
              <LogIn className="h-4 w-4" />
              NGO Login
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

    