
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
    return cn(
      baseClassName,
      "hover:text-foreground/80 transition-colors",
      pathname === href ? activeClassName : 'text-foreground/60'
      );
  };
  
  const getButtonVariant = (href: string) => {
    return pathname === href ? 'secondary' : 'ghost';
  }


  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavLinks = (isMobile: boolean = false) => {
    const commonLinkAction = isMobile ? closeMobileMenu : undefined;
    const linkSizeClass = isMobile ? "text-base py-3" : "text-sm";
    const buttonSize = isMobile ? "default" : "sm";
    const activePrimary = "text-primary font-semibold";
    const activeAccent = "text-accent font-semibold";

    if (loading) {
      return (
        <div className={cn(
          "flex items-stretch gap-1 animate-pulse",
          isMobile ? "flex-col p-4" : "sm:flex-row sm:items-center sm:gap-2"
        )}>
          <div className={cn("h-9 rounded-md bg-muted", isMobile ? "w-full" : "w-24")}></div>
          <div className={cn("h-9 rounded-md bg-muted", isMobile ? "w-full" : "w-28")}></div>
          <div className={cn("h-9 rounded-md bg-muted", isMobile ? "w-full" : "w-24")}></div>
        </div>
      );
    }

    if (userRole === 'ngo' && currentUser) {
      return (
        <div className={cn(
          "flex items-stretch gap-1",
          isMobile ? "flex-col p-4 space-y-2" : "sm:flex-row sm:items-center sm:gap-2"
        )}>
          <Button variant={getButtonVariant("/ngo-dashboard")} size={buttonSize} asChild className={cn("justify-start", isMobile ? "w-full" : "sm:justify-center")}>
            <Link href="/ngo-dashboard" onClick={commonLinkAction} className={getLinkClassName("/ngo-dashboard", activePrimary, `flex items-center gap-1.5 ${linkSizeClass}`)}>
              <LayoutDashboard className="h-4 w-4" />
              My Dashboard
            </Link>
          </Button>
          <Button variant="outline" size={buttonSize} onClick={handleLogout} className={cn("border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive-foreground justify-start", linkSizeClass, isMobile ? "w-full" : "sm:justify-center")}>
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
          <Button variant={getButtonVariant("/donor-dashboard")} size={buttonSize} asChild className={cn("justify-start", isMobile ? "w-full" : "sm:justify-center")}>
            <Link href="/donor-dashboard" onClick={commonLinkAction} className={getLinkClassName("/donor-dashboard", activeAccent, `flex items-center gap-1.5 ${linkSizeClass}`)}>
              <LayoutDashboard className="h-4 w-4" />
              My Dashboard
            </Link>
          </Button>
          <Button variant={getButtonVariant("/browse-ngos")} size={buttonSize} asChild className={cn("justify-start", isMobile ? "w-full" : "sm:justify-center")}>
            <Link href="/browse-ngos" onClick={commonLinkAction} className={getLinkClassName("/browse-ngos", activeAccent, `flex items-center gap-1.5 ${linkSizeClass}`)}>
              <Search className="h-4 w-4" />
              Browse NGOs
            </Link>
          </Button>
           <Button variant="outline" size={buttonSize} onClick={handleLogout} className={cn("border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive-foreground justify-start", linkSizeClass, isMobile ? "w-full" : "sm:justify-center")}>
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
        "flex items-stretch gap-0.5 md:gap-1",
        isMobile ? "flex-col p-4 space-y-2" : "sm:flex-row sm:items-center sm:gap-1"
      )}>
        <Button variant={getButtonVariant("/donor")} size={buttonSize} asChild className={cn("justify-start", isMobile ? "w-full" : "sm:justify-center")}>
          <Link href="/donor" onClick={commonLinkAction} className={getLinkClassName("/donor", activeAccent, `flex items-center gap-1.5 ${linkSizeClass}`)}>
            <HandHeart className="h-4 w-4" />
            View Requests
          </Link>
        </Button>
        <Button variant={getButtonVariant("/browse-ngos")} size={buttonSize} asChild className={cn("justify-start", isMobile ? "w-full" : "sm:justify-center")}>
          <Link href="/browse-ngos" onClick={commonLinkAction} className={getLinkClassName("/browse-ngos", activeAccent, `flex items-center gap-1.5 ${linkSizeClass}`)}>
            <Search className="h-4 w-4" />
            Browse NGOs
          </Link>
        </Button>
        <Button variant="outline" size={buttonSize} asChild className={cn("border-accent text-accent hover:bg-accent/10 hover:text-accent justify-start", isMobile ? "w-full" : "sm:justify-center", pathname === "/login-donor" && "bg-accent/10 font-semibold")}>
          <Link href="/login-donor" onClick={commonLinkAction} className={cn("flex items-center gap-1.5", linkSizeClass)}>
            <UserCircle className="h-4 w-4" />
            Donor Login
          </Link>
        </Button>
        <Button variant="default" size={buttonSize} asChild className={cn("bg-primary hover:bg-primary/90 justify-start", isMobile ? "w-full" : "sm:justify-center", pathname === "/login-ngo" && "ring-2 ring-primary-foreground ring-offset-2 ring-offset-primary")}>
          <Link href="/login-ngo" onClick={commonLinkAction} className={cn("flex items-center gap-1.5", linkSizeClass)}>
            <Building2 className="h-4 w-4" />
            NGO Login/Register
          </Link>
        </Button>
      </div>
    );
  };


  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link 
          href="/" 
          onClick={closeMobileMenu} 
          className={cn(
            "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors",
            pathname === '/' ? 'font-semibold' : ''
          )}>
          <HeartPulse className="h-7 w-7 md:h-8 md:w-8 text-accent" />
          <h1 className="text-lg md:text-2xl font-headline">MediShare</h1>
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
            className="text-primary hover:text-accent"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="sm:hidden flex flex-col items-stretch bg-card py-2 shadow-lg absolute top-full left-0 right-0 z-40 border-t border-border animate-in fade-in-50 slide-in-from-top-2 duration-300">
          {renderNavLinks(true)}
        </nav>
      )}
    </header>
  );
}
