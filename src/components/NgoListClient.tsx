
'use client';

import React, { useState, useMemo } from 'react'; // Removed useEffect as it's no longer needed for mock data loading
import { NgoCard } from './NgoCard';
import { NgoFilterControls, NgoFilters } from './NgoFilterControls';
import type { NGO } from '@/types';
import { Frown } from 'lucide-react';
// Removed: import { mockNgos } from '@/data/mockData'; 

const initialFilters: NgoFilters = {
  location: '',
  type: 'all',
};

interface NgoListClientProps {
  initialNgos: NGO[]; // Define prop type
}

export function NgoListClient({ initialNgos }: NgoListClientProps) { 
  const [filters, setFilters] = useState<NgoFilters>(initialFilters);
  const [ngos, setNgos] = useState<NGO[]>(initialNgos); // Initialize ngos state with the prop
  const [isLoading, setIsLoading] = useState<boolean>(false); // Data is passed directly, so not initially loading

  // Removed useEffect that previously loaded mockNgos with setTimeout

  const filteredNgos = useMemo(() => {
    return ngos.filter((ngo) => {
      const locationMatch = filters.location
        ? ngo.city.toLowerCase().includes(filters.location.toLowerCase()) ||
          ngo.address.toLowerCase().includes(filters.location.toLowerCase())
        : true;
      const typeMatch = filters.type === 'all' ? true : ngo.type === filters.type;
      return locationMatch && typeMatch;
    });
  }, [ngos, filters]);

  const handleFilterChange = (newFilters: NgoFilters) => {
    setFilters(newFilters);
  };
  
  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // If initialNgos is empty (or for future async loading), isLoading might be true.
  // For now, with mockNgos passed, this skeleton might not show unless isLoading is explicitly managed.
  if (isLoading) { 
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-card p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-40 bg-muted rounded mb-4"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div>
      <NgoFilterControls filters={filters} onFilterChange={handleFilterChange} onResetFilters={resetFilters} />
      {filteredNgos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {filteredNgos.map((ngo) => (
            <NgoCard key={ngo.id || ngo.uid} ngo={ngo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground/80">No NGOs Found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters or browse all NGOs.
          </p>
        </div>
      )}
    </div>
  );
}
