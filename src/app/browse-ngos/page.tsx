
import { NgoListClient } from '@/components/NgoListClient';
import { SearchCode, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { NGO } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function fetchNgos(): Promise<{ data: NGO[], error: string | null }> {
  if (!db) {
    const errorMessage = "Firebase DB is not initialized. Cannot fetch NGOs.";
    console.error(errorMessage);
    return { data: [], error: errorMessage };
  }
  try {
    const ngosCollection = collection(db, 'ngos');
    const q = query(ngosCollection, orderBy('name', 'asc'));
    const ngoSnapshot = await getDocs(q);

    if (ngoSnapshot.empty) {
        return { data: [], error: null };
    }
    
    const ngosList = ngoSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: doc.id, // The document ID is the UID
        ...data
      } as NGO;
    });

    return { data: ngosList, error: null };
  } catch (error: any) {
    console.error("Error fetching NGOs:", error);
    let errorMessage = "An unexpected error occurred while fetching NGOs.";
    if (error.code === 'permission-denied') {
      errorMessage = "Permission denied. Please check your Firestore security rules to allow public read access to the 'ngos' collection.";
    } else if (error.code === 'failed-precondition') {
        errorMessage = "A Firestore index is missing. Check your browser's developer console (F12) for a Firebase link to create the required index for ordering NGOs.";
    }
    return { data: [], error: errorMessage };
  }
}


export default async function BrowseNgosPage() {
  const { data: registeredNgos, error } = await fetchNgos();

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <section className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 md:mb-6">
          <SearchCode className="h-10 w-10 md:h-12 md:w-12 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-3 md:mb-4 text-primary">
          Discover NGOs Near You
        </h1>
        <p className="text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
          Find local organizations where your unused medicine can make a difference. Use the filters below to narrow down your search.
        </p>
      </section>
      
      {error ? (
        <Alert variant="destructive" className="max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading NGOs</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : (
        <NgoListClient initialNgos={registeredNgos} />
      )}
    </div>
  );
}

export const metadata = {
  title: 'Browse NGOs - MediShare',
  description: 'Find and connect with NGOs to donate your unused medicines.',
};
