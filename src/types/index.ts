
export interface NGO {
  id?: string; // This will be the Firebase Auth UID, so it might not be part of Firestore doc if UID is doc ID
  uid: string; // Firebase Auth User ID, will be the document ID in Firestore 'ngos' collection
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
  services?: string[]; // Made optional as it's not in registration form initially
  'data-ai-hint'?: string;
}
