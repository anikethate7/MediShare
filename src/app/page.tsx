
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserCircle, Building2, HeartPulse } from 'lucide-react';
import { LatestRequestsSection } from '@/components/LatestRequestsSection';
import { HomepageImpactStoriesSection } from '@/components/HomepageImpactStoriesSection';
import { db as firebaseDb } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore'; // Renamed limit to avoid conflict

async function getUrgentRequestsFlag() {
  if (!firebaseDb) return false;
  try {
    const requestsQuery = query(
      collection(firebaseDb, 'donationRequests'),
      where('status', '==', 'Open'),
      where('urgency', '==', 'High'),
      firestoreLimit(1)
    );
    const querySnapshot = await getDocs(requestsQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking for urgent requests on homepage:", error);
    return false; 
  }
}

export default async function HomePage() {
  const hasUrgentRequests = await getUrgentRequestsFlag();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] py-8 md:py-12 animate-fade-in space-y-12 md:space-y-16">
      
      {hasUrgentRequests && (
        <section className="text-center max-w-3xl mx-auto">
          <div className="mb-4 md:mb-6">
            <HeartPulse className="h-16 w-16 md:h-20 md:w-20 text-primary mx-auto opacity-80" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold mb-4 md:mb-6">
            <span className="text-primary">Medi</span><span className="text-accent">Share</span>: Bridging Gaps,
            <br className="hidden sm:block" />
            Saving Lives.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-foreground/70 leading-relaxed">
            Connect, Donate, Impact. We empower communities by redistributing surplus medicines to those who need them most, seamlessly and effectively.
          </p>
        </section>
      )}

      <section className="w-full max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-xl border-2 border-transparent hover:border-accent/50">
            <CardHeader className="text-center items-center">
              <div className="bg-accent/10 p-4 rounded-full w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                <UserCircle className="h-10 w-10 md:h-12 md:w-12 text-accent" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-headline text-accent">Are you a Donor?</CardTitle>
              <CardDescription className="text-sm md:text-base text-foreground/70 pt-2">
                Your unused medicines can be a lifeline. Explore requests and make a difference today.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2 pb-6">
              <Button asChild size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-md py-3.5 rounded-lg group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-accent-foreground/50 transition-all">
                <Link href="/login-donor">
                  Access Donor Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-xl border-2 border-transparent hover:border-primary/50">
            <CardHeader className="text-center items-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-headline text-primary">Are you an NGO?</CardTitle>
              <CardDescription className="text-sm md:text-base text-foreground/70 pt-2">
                Connect with donors, post your needs, and receive vital medical supplies.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2 pb-6">
              <Button asChild size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-md py-3.5 rounded-lg group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-primary-foreground/50 transition-all">
                <Link href="/login-ngo">
                  Access NGO Portal <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <LatestRequestsSection />
      <HomepageImpactStoriesSection />

    </div>
  );
}
