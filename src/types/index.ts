
import type { Timestamp } from 'firebase/firestore';

export interface NGO {
  id?: string; // This will be the Firebase Auth UID, so it might not be part of Firestore doc if UID is doc ID
  uid: string; // Firebase Auth User ID, will be the document ID in Firestore 'ngos' collection
  name: string;
  type: 'Medical Facility' | 'Community Health' | 'Disaster Relief' | 'General Welfare' | 'Animal Welfare';
  address: string;
  city: string;
  description: string;
  contactEmail?: string; // Made consistently optional
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
  id?: string; // Firestore document ID
  ngoUid: string;
  ngoName: string; // Storing NGO name directly for quick display
  medicineName: string;
  description: string; // e.g., strength, type
  quantityNeeded: string;
  urgency: UrgencyLevel;
  status: DonationRequestStatus;
  notes?: string;
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt: Timestamp; // Firestore Timestamp
}
