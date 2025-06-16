
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let initializationError: Error | null = null;

if (
  !firebaseConfigValues.apiKey ||
  !firebaseConfigValues.authDomain ||
  !firebaseConfigValues.projectId ||
  !firebaseConfigValues.appId // appId is also crucial for initialization
) {
  const errorMessage = "Firebase configuration is incomplete. Please ensure all NEXT_PUBLIC_FIREBASE_ environment variables (apiKey, authDomain, projectId, appId, etc.) are set correctly in your .env.local file and restart your development server.";
  initializationError = new Error(errorMessage);
  console.error(errorMessage);
} else {
  try {
    appInstance = !getApps().length ? initializeApp(firebaseConfigValues) : getApp();
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
  } catch (err: any) {
    const errorMessage = `Firebase initialization failed: ${err.message}. This often means your API key in .env.local is incorrect for the Firebase project, or the project/app is not properly set up. Please verify your Firebase project settings and .env.local file.`;
    initializationError = new Error(errorMessage);
    console.error(errorMessage, err);
    appInstance = null; // Ensure these are null on error
    authInstance = null;
    dbInstance = null;
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const firebaseInitError = initializationError;
