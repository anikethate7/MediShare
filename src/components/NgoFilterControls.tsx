'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, X } from 'lucide-react';
import type { NGO } from '@/types';
import { ngoTypes as allNgoTypes } from '@/data/mockData';

export interface NgoFilters {
  location: string;
  type: NGO['type'] | 'all';
}

interface NgoFilterControlsProps {
  filters: NgoFilters;
  onFilterChange: (newFilters: NgoFilters) => void;
  onResetFilters: () => void;
}

export function NgoFilterControls({ filters, onFilterChange, onResetFilters }: NgoFilterControlsProps) {
  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, location: event.target.value });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({ ...filters, type: value as NGO['type'] | 'all' });
  };
  
  const hasActiveFilters = filters.location !== '' || filters.type !== 'all';

  return (
    <div className="mb-8 p-6 bg-card rounded-lg shadow-md space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <Label htmlFor="location-search" className="text-lg font-semibold mb-2 block text-primary">
            <Search className="inline-block h-5 w-5 mr-2 text-accent" />
            Search by Location
          </Label>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="location-search"
              type="text"
              placeholder="Enter city or address..."
              value={filters.location}
              onChange={handleLocationChange}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="ngo-type-filter" className="text-lg font-semibold mb-2 block text-primary">
            <ListFilter className="inline-block h-5 w-5 mr-2 text-accent" />
            Filter by Type
          </Label>
          <Select value={filters.type} onValueChange={handleTypeChange}>
            <SelectTrigger id="ngo-type-filter" className="w-full">
              <SelectValue placeholder="Select NGO type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {allNgoTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {hasActiveFilters && (
         <Button variant="ghost" onClick={onResetFilters} className="text-sm text-accent hover:text-accent/80">
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
      )}
    </div>
  );
}
