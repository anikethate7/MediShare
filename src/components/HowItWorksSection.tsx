
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Search, HandHeart, UserPlus2, ClipboardPlus, Users, Sparkles } from 'lucide-react';

const donorSteps = [
  {
    icon: <LogIn className="h-8 w-8 text-accent" />,
    title: 'Step 1: Login or Register',
    description: 'Quickly sign up or log in to your donor account to get started.',
  },
  {
    icon: <Search className="h-8 w-8 text-accent" />,
    title: 'Step 2: Find Needs',
    description: 'Browse active donation requests from NGOs or discover local organizations.',
  },
  {
    icon: <HandHeart className="h-8 w-8 text-accent" />,
    title: 'Step 3: Offer Your Help',
    description: 'Securely contact NGOs to offer your unused medicines and arrange donation.',
  },
];

const ngoSteps = [
  {
    icon: <UserPlus2 className="h-8 w-8 text-primary" />,
    title: 'Step 1: Register Your NGO',
    description: 'Create an account for your organization to start receiving donations.',
  },
  {
    icon: <ClipboardPlus className="h-8 w-8 text-primary" />,
    title: 'Step 2: Post Medicine Needs',
    description: 'List the specific medicines your NGO requires for its beneficiaries.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Step 3: Connect with Donors',
    description: 'Receive offers from generous donors and coordinate to receive medicines.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="w-full max-w-5xl mx-auto py-12 md:py-16">
      <div className="text-center mb-10 md:mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3 md:mb-4 mx-auto w-fit">
          <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-primary mb-2">
          How MediShare Works
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
          A simple process for Donors and NGOs to connect and make a difference.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-accent mb-6 text-center">For Donors</h3>
          <div className="space-y-6">
            {donorSteps.map((step, index) => (
              <Card key={`donor-step-${index}`} className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
                <CardHeader className="flex flex-row items-center gap-4 pb-3 pt-5 px-5">
                  <div className="bg-accent/10 p-3 rounded-full w-fit">
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl text-accent">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-sm text-foreground/80">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-primary mb-6 text-center">For NGOs</h3>
          <div className="space-y-6">
            {ngoSteps.map((step, index) => (
              <Card key={`ngo-step-${index}`} className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
                <CardHeader className="flex flex-row items-center gap-4 pb-3 pt-5 px-5">
                   <div className="bg-primary/10 p-3 rounded-full w-fit">
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl text-primary">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-sm text-foreground/80">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
