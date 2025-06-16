
import type { NGO } from '@/types';

// Note: With Firebase integration, this mock data will primarily be for display if
// Firestore data isn't fetched or if you want initial placeholders.
// The 'id' here is a mock ID; in Firestore, the document ID will be the user's UID.

export const mockNgos: Omit<NGO, 'uid'>[] & {id: string}[] = [ // Adjusted to match potential local use before Firestore data
  {
    id: '1', // This 'id' is for local mock data. Firestore will use UID.
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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
