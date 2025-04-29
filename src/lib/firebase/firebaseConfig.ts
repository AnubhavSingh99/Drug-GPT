
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from "firebase/database"; // Import Realtime Database
import { getAuth } from "firebase/auth"; // Import Auth if needed

const firebaseConfig = {
  apiKey: "AIzaSyDFL9sommPTbMQD2emw8u-oHOiOJ7uw2i0", // Use provided key
  authDomain: "medigraph-a0945.firebaseapp.com", // Use provided domain
  databaseURL: "https://medigraph-a0945-default-rtdb.firebaseio.com", // Use provided database URL
  projectId: "medigraph-a0945", // Use provided project ID
  storageBucket: "medigraph-a0945.firebasestorage.app", // Use provided storage bucket
  messagingSenderId: "548192566469", // Use provided sender ID
  appId: "1:548192566469:web:8d470d5ebbe99c174dc4ac", // Use provided app ID
  measurementId: "G-D8F1JBCQXE" // Use provided measurement ID
};

// Initialize Firebase
// Check if Firebase has already been initialized to prevent errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Realtime Database instance
const database = getDatabase(app);

// Initialize and export Auth instance (optional, if needed)
const auth = getAuth(app);


export { app, database, auth };

// Analytics is often initialized separately if needed, e.g., in a specific component or layout
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);
// export { analytics };
