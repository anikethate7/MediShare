
'use client';

import Link from 'next/link';
import { HeartPulse, Search, LogOut, LayoutDashboard, HandHeart, UserCircle, Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

export function AppHeader() {
  const { currentUser, userRole, ngoProfile, donorProfile, logout, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Close mobile menu on route changes
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      setIsMobileMenuOpen(false);
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavLinks = (isMobile: boolean = false) => {
    const commonLinkAction = isMobile ? closeMobileMenu : undefined;

    if (loading) {
      return (
        <div className={cn(
          "flex items-stretch gap-1 animate-pulse",
          isMobile ? "flex-col p-4" : "sm:flex-row sm:items-center sm:gap-2"
        )}>
          <div className="h-9 w-full sm:w-24 bg-muted rounded-md"></div>
          <div className="h-9 w-full sm:w-28 bg-muted rounded-md"></div>
          <div className="h-9 w-full sm:w-24 bg-muted rounded-md"></div>
        </div>
      );
    }

    if (userRole === 'ngo' && currentUser) {
      return (
        <div className={cn(
          "flex items-stretch gap-1",
          isMobile ? "flex-col p-4 space-y-2" : "sm:flex-row sm:items-center sm:gap-2"
        )}>
          <Button variant="ghost" size="sm" asChild className={cn("justify-start", isMobile ? "w-full" : "sm:justify-center")}>
            <Link href="/ngo-dashboard" onClick={commonLinkAction} className={getLinkClassName("/ngo-dashboard", "text-primary font-semibold", "flex items-center gap-1.5")}>
              <LayoutDashboard className="h-4 w-4 text-primary" />
              My Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className={cn("text-sm border-accent text-accent hover:bg-accent/10 hover:text-accent justify-start", isMobile ? "w-full" : "sm:justify-center")}>
            <LogOut className="h-4 w-4 mr-1" />
            <span>Logout</span>
          </Button>
          {ngoProfile && <span className={cn("text-xs text-muted-foreground self-center pt-1", isMobile ? "text-center py-2" : "hidden lg:inline sm:pt-0")}>Welcome, {ngoProfile.name.split(' ')[0]}!</span>}
        </div>
      );
    }

    if (userRole === 'donor' && currentUser) {
      return (
        <div className={cn(
          "flex items-stretch gap-1",
          isMobile ? "flex-col p-4 space-y-2" : "sm:flex-row sm:items-center sm:gap-2"
        )}>
          <Button variant="ghost" size="sm" asChild className={cn("justify-start", isMobile ? "w-full" : "sm:justify-center")}>
            <Link href="/donor-dashboard" onClick={commonLinkAction} className={getLinkClassName("/donor-dashboard", "text-accent font-semibold", "flex items-center gap-1.5")}>
              <LayoutDashboard className="h-4 w-4 text-accent" />
              My Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className={cn("justify-start", isMobile ? "w-full" : "sm:justify-center")}>
            <Link href="/browse-ngos" onClick={commonLinkAction} className={getLinkClassName("/browse-ngos", "text-accent font-semibold", "flex items-center gap-1.5")}>
              <Search className="h-4 w-4 text-accent" />
              Browse NGOs
            </Link>
          </Button>
           <Button variant="outline" size="sm" onClick={handleLogout} className={cn("text-sm border-accent text-accent hover:bg-accent/10 hover:text-accent justify-start", isMobile ? "w-full" : "sm:justify-center")}>
            <LogOut className="h-4 w-4 mr-1" />
            <span>Logout</span>
          </Button>
          {donorProfile && <span className={cn("text-xs text-muted-foreground self-center pt-1", isMobile ? "text-center py-2" : "hidden lg:inline sm:pt-0")}>Welcome, {donorProfile.name.split(' ')[0]}!</span>}
        </div>
      );
    }

    // Default links for unauthenticated users
    return (
      <div className={cn(
        "flex items-stretch gap-1",
        isMobile ? "flex-col p-4 space-y-2" : "sm:flex-row sm:items-center sm:gap-2"
      )}>
        <Button variant="ghost" size="sm" asChild className={cn("justify-start", isMobile ? "w-full text-base py-3" : "sm:justify-center")}>
          <Link href="/donor" onClick={commonLinkAction} className={getLinkClassName("/donor", "text-accent font-semibold", "flex items-center gap-1.5")}>
            <HandHeart className="h-4 w-4 text-accent" />
            View Requests
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className={cn("justify-start", isMobile ? "w-full text-base py-3" : "sm:justify-center")}>
          <Link href="/browse-ngos" onClick={commonLinkAction} className={getLinkClassName("/browse-ngos", "text-accent font-semibold", "flex items-center gap-1.5")}>
            <Search className="h-4 w-4 text-accent" />
            Browse NGOs
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className={cn("text-accent border-accent hover:bg-accent/10 hover:text-accent justify-start", isMobile ? "w-full text-base py-3" : "text-sm sm:justify-center")}>
          <Link href="/login-donor" onClick={commonLinkAction} className={getLinkClassName("/login-donor", "font-semibold", "flex items-center gap-1.5")}>
            <UserCircle className="h-4 w-4" />
            Donor Login
          </Link>
        </Button>
        <Button variant="default" size="sm" asChild className={cn("bg-primary hover:bg-primary/90 justify-start", isMobile ? "w-full text-base py-3" : "text-sm sm:justify-center")}>
          <Link href="/login-ngo" onClick={commonLinkAction} className={getLinkClassName("/login-ngo", "font-semibold", "flex items-center gap-1.5")}>
            <Building2 className="h-4 w-4" />
            NGO Login/Register
          </Link>
        </Button>
      </div>
    );
  };


  return (
    <header className="bg-card shadow-md sticky top-0 z-50 relative">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link 
          href="/" 
          onClick={closeMobileMenu} 
          className={cn(
            "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors",
            pathname === '/' ? 'font-semibold' : ''
          )}>
          <HeartPulse className="h-8 w-8 text-accent" />
          <h1 className="text-xl md:text-2xl font-headline">MediShare</h1>
        </Link>
        
        <nav className="hidden sm:flex">
          {renderNavLinks(false)}
        </nav>

        <div className="sm:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="sm:hidden flex flex-col items-stretch bg-card py-2 shadow-lg absolute top-full left-0 right-0 z-40 border-t border-border animate-fade-in">
          {renderNavLinks(true)}
        </nav>
      )}
    </header>
  );
}
