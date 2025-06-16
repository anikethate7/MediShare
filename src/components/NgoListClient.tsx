'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { NgoCard } from './NgoCard';
import { NgoFilterControls, NgoFilters } from './NgoFilterControls';
import type { NGO } from '@/types';
import { Frown } from 'lucide-react';
import { mockNgos } from '@/data/mockData'; // Ensure this path is correct

const initialFilters: NgoFilters = {
  location: '',
  type: 'all',
};

export function NgoListClient() {
  const [filters, setFilters] = useState<NgoFilters>(initialFilters);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setIsLoading(true);
    // In a real app, you would fetch mockNgos or from an API
    // For now, we directly use the imported mockNgos
    setTimeout(() => { // Simulate network delay
        setNgos(mockNgos);
        setIsLoading(false);
    }, 500);
  }, []);


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
            <NgoCard key={ngo.id} ngo={ngo} />
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
