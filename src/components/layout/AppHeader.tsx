
'use client';

import Link from 'next/link';
import { HeartPulse, Search, Lightbulb, UserPlus, LogIn, LogOut, UserCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { currentUser, ngoProfile, logout, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <header className="bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <HeartPulse className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-headline font-bold">MediShare</h1>
          </Link>
          <div className="animate-pulse flex items-center gap-1 sm:gap-2">
            <div className="h-7 w-20 bg-muted rounded-md"></div>
            <div className="h-7 w-20 bg-muted rounded-md"></div>
            <div className="h-7 w-28 bg-muted rounded-md"></div>
            <div className="h-7 w-24 bg-muted rounded-md"></div>
          </div>
        </div>
      </header>
    );
  }

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
          {currentUser ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/ngo-dashboard" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <LayoutDashboard className="h-4 w-4 text-accent" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
                <LogOut className="h-4 w-4 text-accent mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              {ngoProfile && <span className="text-xs text-muted-foreground hidden lg:inline">Welcome, {ngoProfile.name.split(' ')[0]}!</span>}
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
