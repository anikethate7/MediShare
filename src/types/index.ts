export interface NGO {
  id: string;
  name: string;
  type: 'Medical Facility' | 'Community Health' | 'Disaster Relief' | 'General Welfare' | 'Animal Welfare';
  address: string;
  city: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  imageUrl?: string;
  operatingHours?: string;
  services: string[];
  'data-ai-hint'?: string; // Added for more specific image placeholder hints
}
