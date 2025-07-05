// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase config to prevent "client is offline" errors.
// This error typically happens when the configuration is incomplete, especially the projectId.
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
const missingConfigKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingConfigKeys.length > 0) {
    const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase();
    const errorMessage = `Missing Firebase configuration. Please check your .env file for the following keys: ${missingConfigKeys.map(key => `NEXT_PUBLIC_FIREBASE_${toSnakeCase(key)}`).join(', ')}. After updating, you may need to restart the development server.`;
    throw new Error(errorMessage);
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
