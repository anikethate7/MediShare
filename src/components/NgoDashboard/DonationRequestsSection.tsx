
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox } from 'lucide-react';

export function DonationRequestsSection() {
  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Inbox className="h-6 w-6 text-accent" />
            Donation Requests
        </CardTitle>
        <CardDescription>
          Manage incoming donation offers or list your specific medicine needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-8 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground/80">
            Feature Coming Soon!
          </p>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            This section will allow you to view and manage medicine donation offers from donors, or post requests for specific medicines your NGO currently needs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
