
import type { NGO, ImpactStory } from '@/types';
import type { Timestamp } from 'firebase/firestore';

// Note: With Firebase integration, this mock data will primarily be for display if
// Firestore data isn't fetched or if you want initial placeholders.
// The 'id' here is a mock ID; in Firestore, the document ID will be the user's UID.
// Added 'uid' to each mock NGO to align with potential usage where UID is expected.

export const mockNgos: NGO[] = [
  {
    id: 'mock1',
    uid: 'mock-uid-asha-health',
    name: 'Asha Health Clinic',
    type: 'Medical Facility',
    address: '12 MG Road',
    city: 'Mumbai',
    description: 'Provides free medical consultations and basic treatments to underprivileged individuals in urban slums. Specializes in primary healthcare.',
    contactEmail: 'contact@ashahealth.in',
    contactPhone: '+91 98000 00101',
    website: 'https://ashahealth.example.in',
    imageUrl: 'https://placehold.co/600x400.png',
    operatingHours: 'Mon-Fri: 9 AM - 5 PM',
    services: ['General Consultation', 'Basic Treatments', 'Maternal Health', 'Child Vaccinations'],
    'data-ai-hint': 'indian clinic'
  },
  {
    id: 'mock2',
    uid: 'mock-uid-seva-community',
    name: 'Seva Community Centre',
    type: 'Community Health',
    address: '45 Gandhi Nagar',
    city: 'Delhi',
    description: 'Focuses on community health awareness, hygiene programs, and supports local families with health resources and medicine collection drives.',
    contactEmail: 'info@sevacommunity.in',
    website: 'https://sevacommunity.example.in',
    imageUrl: 'https://placehold.co/600x400.png',
    operatingHours: 'Mon-Sat: 10 AM - 6 PM',
    services: ['Health Education', 'Hygiene Workshops', 'Medicine Collection', 'Nutrition Support'],
    'data-ai-hint': 'community center india'
  },
  {
    id: 'mock3',
    uid: 'mock-uid-sahayata-relief',
    name: 'Sahayata Disaster Relief',
    type: 'Disaster Relief',
    address: '78 Relief Marg',
    city: 'Chennai',
    description: 'Deploys medical teams and essential supplies during floods and other natural calamities in the region. Accepts first-aid and emergency medicines.',
    contactPhone: '+91 99000 00103',
    website: 'https://sahayatarelief.example.in',
    imageUrl: 'https://placehold.co/600x400.png',
    operatingHours: '24/7 during emergencies',
    services: ['Emergency Medical Aid', 'First-Aid Kits', 'Sanitation Support', 'Post-Disaster Care'],
    'data-ai-hint': 'disaster relief india'
  },
  {
    id: 'mock4',
    uid: 'mock-uid-manav-kalyan',
    name: 'Manav Kalyan Sanstha',
    type: 'General Welfare',
    address: '101 Karuna Lane',
    city: 'Kolkata',
    description: 'Offers support to vulnerable populations, including collection of over-the-counter medications and basic health check-ups for the elderly.',
    contactEmail: 'support@mksanstha.in',
    contactPhone: '+91 97000 00104',
    imageUrl: 'https://placehold.co/600x400.png',
    operatingHours: 'Mon-Fri: 9 AM - 4 PM',
    services: ['OTC Medicine Collection', 'Elderly Care', 'Community Kitchen', 'Skill Development'],
    'data-ai-hint': 'welfare organization india'
  },
  {
    id: 'mock5',
    uid: 'mock-uid-gram-swasthya',
    name: 'Gram Swasthya Initiative',
    type: 'Medical Facility',
    address: '22 Rural Connect Rd',
    city: 'Bangalore Rural',
    description: 'Aims to improve healthcare access in rural areas. Runs mobile medical camps and accepts a wide range of essential medicines.',
    contactEmail: 'gramswasthya@gsi.in',
    website: 'https://gsi.example.in',
    imageUrl: 'https://placehold.co/600x400.png',
    operatingHours: 'Varies by mobile camp schedule',
    services: ['Mobile Medical Camps', 'Rural Healthcare', 'Pediatric Services', 'Disease Prevention'],
    'data-ai-hint': 'rural healthcare india'
  },
  {
    id: 'mock6',
    uid: 'mock-uid-jeev-raksha',
    name: 'Jeev Raksha Animal Care',
    type: 'Animal Welfare',
    address: '33 Prakriti Vihar',
    city: 'Pune',
    description: 'Provides veterinary care and shelter for stray and abandoned animals. Accepts donations of animal-specific medications and food.',
    contactEmail: 'care@jeevraksha.in',
    contactPhone: '+91 96000 00106',
    imageUrl: 'https://placehold.co/600x400.png',
    operatingHours: 'Tue-Sun: 10 AM - 4 PM',
    services: ['Veterinary Services', 'Animal Medication', 'Rescue Operations', 'Adoption Drives'],
    'data-ai-hint': 'animal shelter india'
  },
];

export const ngoTypes: NGO['type'][] = ['Medical Facility', 'Community Health', 'Disaster Relief', 'General Welfare', 'Animal Welfare'];

// Helper to create a mock Timestamp-like object for client-side rendering
const createMockTimestamp = (date: Date): Timestamp => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000,
  isEqual: function (other: Timestamp): boolean {
    return this.seconds === other.seconds && this.nanoseconds === other.nanoseconds;
  },
  valueOf: function (): string {
    return `Timestamp(seconds=${this.seconds}, nanoseconds=${this.nanoseconds})`;
  },
  toJSON: function (): { seconds: number; nanoseconds: number; } {
    return { seconds: this.seconds, nanoseconds: this.nanoseconds };
  },
  toString: function (): string {
     return `Timestamp(seconds=${this.seconds}, nanoseconds=${this.nanoseconds})`;
  },
  // These are not typically on client-side mock unless needed for specific logic not present here
  // compareTo: function (other: Timestamp): number { return 0; }, 
  // _compareTo: function (other: Timestamp): number { return 0; }, 
});


export const mockImpactStories: ImpactStory[] = [
  {
    id: 'story1',
    ngoUid: 'mock-uid-asha-health',
    ngoName: 'Asha Health Clinic',
    title: 'Critical Medicines Arrived Just In Time!',
    storyContent: "Thanks to a generous donation of antibiotics through MediShare, we were able to treat a sudden outbreak of infections in the community. Many children's lives were positively impacted. This platform truly makes a difference!",
    imageUrl: 'https://placehold.co/600x300.png',
    'data-ai-hint': 'doctor child',
    createdAt: createMockTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000 * 2)), // 2 days ago
  },
  {
    id: 'story2',
    ngoUid: 'mock-uid-seva-community',
    ngoName: 'Seva Community Centre',
    title: 'Elderly Care Program Enhanced',
    storyContent: "The regular supply of vitamins and common pain relievers we received has greatly helped our elderly care program. Our seniors are feeling better and more active. We are grateful for the continuous support from donors.",
    imageUrl: 'https://placehold.co/600x400.png',
    'data-ai-hint': 'elderly happy',
    createdAt: createMockTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000 * 5)), // 5 days ago
  },
  {
    id: 'story3',
    ngoUid: 'mock-uid-sahayata-relief',
    ngoName: 'Sahayata Disaster Relief',
    title: 'First-Aid Kits Made a Huge Difference',
    storyContent: "During the recent flash floods, the first-aid supplies donated via MediShare were invaluable. Our team could provide immediate assistance to many injured individuals. Thank you for helping us respond effectively!",
    // No image for this one
    'data-ai-hint': 'emergency aid',
    createdAt: createMockTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000 * 10)), // 10 days ago
  },
];
