
import type { Timestamp } from 'firebase/firestore';

export interface NGO {
  id?: string; 
  uid: string; 
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
  services?: string[];
  'data-ai-hint'?: string;
}

export type DonationRequestStatus = 'Open' | 'Fulfilled' | 'Closed';
export type UrgencyLevel = 'High' | 'Medium' | 'Low';

export interface DonationRequest {
  id?: string; 
  ngoUid: string;
  ngoName: string; 
  medicineName: string;
  description: string; 
  quantityNeeded: string;
  urgency: UrgencyLevel;
  status: DonationRequestStatus;
  notes?: string;
  createdAt: Timestamp; 
  updatedAt: Timestamp; 
}

export interface Donor {
  uid: string; // Firebase Auth User ID, document ID in 'donors' collection
  name: string;
  email: string; // For reference, login is handled by Firebase Auth
  role: 'donor'; // Explicitly set role
  createdAt: Timestamp; // Firestore Timestamp
}

export interface ImpactStory {
  id?: string; // Firestore document ID
  ngoUid: string;
  ngoName: string;
  title: string;
  storyContent: string;
  imageUrl?: string;
  'data-ai-hint'?: string; // For placeholder images
  createdAt: Timestamp;
  // isApproved?: boolean; // Future consideration for moderation
}
