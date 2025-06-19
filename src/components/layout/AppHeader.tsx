
'use client';

import Link from 'next/link';
import { HeartPulse, Search, LogOut, LayoutDashboard, HandHeart, UserCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const { currentUser, userRole, ngoProfile, donorProfile, logout, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

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

  const getLinkClassName = (href: string, activeClassName: string, baseClassName: string = "text-sm") => {
    return cn(baseClassName, pathname === href ? activeClassName : '');
  };

  const renderNavLinks = () => {
    if (loading) {
      return (
        <div className="animate-pulse flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
          <div className="h-7 w-24 bg-muted rounded-md"></div>
          <div className="h-7 w-28 bg-muted rounded-md"></div>
          <div className="h-7 w-24 bg-muted rounded-md"></div>
        </div>
      );
    }

    if (userRole === 'ngo' && currentUser) {
      return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild className="justify-start sm:justify-center">
            <Link href="/ngo-dashboard" className={getLinkClassName("/ngo-dashboard", "text-primary font-semibold", "flex items-center gap-1.5")}>
              <LayoutDashboard className="h-4 w-4 text-primary" />
              My Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-sm border-accent text-accent hover:bg-accent/10 hover:text-accent justify-start sm:justify-center">
            <LogOut className="h-4 w-4 mr-1" />
            <span>Logout</span>
          </Button>
          {ngoProfile && <span className="text-xs text-muted-foreground hidden lg:inline self-center pt-1 sm:pt-0">Welcome, {ngoProfile.name.split(' ')[0]}!</span>}
        </div>
      );
    }

    if (userRole === 'donor' && currentUser) {
      return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild className="justify-start sm:justify-center">
            <Link href="/donor-dashboard" className={getLinkClassName("/donor-dashboard", "text-accent font-semibold", "flex items-center gap-1.5")}>
              <LayoutDashboard className="h-4 w-4 text-accent" />
              My Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="justify-start sm:justify-center">
            <Link href="/browse-ngos" className={getLinkClassName("/browse-ngos", "text-accent font-semibold", "flex items-center gap-1.5")}>
              <Search className="h-4 w-4 text-accent" />
              Browse NGOs
            </Link>
          </Button>
           <Button variant="outline" size="sm" onClick={handleLogout} className="text-sm border-accent text-accent hover:bg-accent/10 hover:text-accent justify-start sm:justify-center">
            <LogOut className="h-4 w-4 mr-1" />
            <span>Logout</span>
          </Button>
          {donorProfile && <span className="text-xs text-muted-foreground hidden lg:inline self-center pt-1 sm:pt-0">Welcome, {donorProfile.name.split(' ')[0]}!</span>}
        </div>
      );
    }

    // Default links for unauthenticated users
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" asChild className="justify-start sm:justify-center">
          <Link href="/donor" className={getLinkClassName("/donor", "text-accent font-semibold", "flex items-center gap-1.5")}>
            <HandHeart className="h-4 w-4 text-accent" />
            View Requests
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="justify-start sm:justify-center">
          <Link href="/browse-ngos" className={getLinkClassName("/browse-ngos", "text-accent font-semibold", "flex items-center gap-1.5")}>
            <Search className="h-4 w-4 text-accent" />
            Browse NGOs
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="text-sm text-accent border-accent hover:bg-accent/10 hover:text-accent justify-start sm:justify-center">
          <Link href="/login-donor" className={getLinkClassName("/login-donor", "font-semibold", "flex items-center gap-1.5")}>
            <UserCircle className="h-4 w-4" />
            Donor Login
          </Link>
        </Button>
        <Button variant="default" size="sm" asChild className="text-sm bg-primary hover:bg-primary/90 justify-start sm:justify-center">
          <Link href="/login-ngo" className={getLinkClassName("/login-ngo", "font-semibold", "flex items-center gap-1.5")}>
            <Building2 className="h-4 w-4" />
            NGO Login/Register
          </Link>
        </Button>
      </div>
    );
  };


  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between">
        <Link href="/" className={cn(
          "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors self-start sm:self-center mb-2 sm:mb-0",
          pathname === '/' ? 'font-semibold' : ''
          )}>
          <HeartPulse className="h-8 w-8 text-accent" />
          <h1 className="text-xl md:text-2xl font-headline">MediShare</h1>
        </Link>
        <nav className="flex w-full sm:w-auto">
          {renderNavLinks()}
        </nav>
      </div>
    </header>
  );
}
