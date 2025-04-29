
import { initializeApp, getApps, getApp } from 'firebase/app';
// Add imports for the specific Firebase services you want to use
// e.g., import { getFirestore } from "firebase/firestore";
// e.g., import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase
// Check if Firebase has already been initialized to prevent errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the initialized app and specific service instances if needed
// e.g., export const db = getFirestore(app);
// e.g., export const auth = getAuth(app);

export { app };

// Example of exporting a specific service (uncomment and adapt as needed):
/*
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);
*/

/*
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
*/
