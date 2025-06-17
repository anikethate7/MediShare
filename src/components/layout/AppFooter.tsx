
'use client';

import React, { useState, useEffect } from 'react';

export function AppFooter() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-card shadow-t-md py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p className="text-sm">
          &copy; {currentYear || new Date().getFullYear()} MediShare. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Connecting communities for a healthier tomorrow.
        </p>
      </div>
    </footer>
  );
}
