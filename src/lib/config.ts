/**
 * @fileOverview This file centralizes the validation of environment variables.
 * It ensures the application doesn't start or build in a misconfigured state,
 * providing clear error messages to facilitate debugging.
 */

/**
 * Validates that all required environment variables for Firebase are set.
 * @returns An object with the validated Firebase configuration.
 * @throws An error if any required environment variable is missing.
 */
export function getFirebaseConfig() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // List of keys that are absolutely required for the app to function.
  const requiredConfigKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];

  const missingConfigKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

  if (missingConfigKeys.length > 0) {
    const toSnakeCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toUpperCase();
    
    // This error message is designed to be as helpful as possible.
    // It tells you exactly which keys are missing from your .env file.
    // The build process (publishing) will fail if these keys are not present.
    const errorMessage = `
      -------------------------------------------------------------------------
      ERROR: MISSING FIREBASE CONFIGURATION
      -------------------------------------------------------------------------
      The application cannot connect to Firebase because some required
      environment variables are missing. This will prevent the project from
      being published successfully.

      Please check your .env file at the root of your project and ensure
      the following keys have values from your Firebase project settings:
      
      ${missingConfigKeys.map(key => `  - NEXT_PUBLIC_FIREBASE_${toSnakeCase(key)}`).join('\n')}

      After adding the keys, you may need to restart the development server.
      If you are publishing, ensure these variables are set in your build environment.
      -------------------------------------------------------------------------
    `;
    throw new Error(errorMessage);
  }

  return firebaseConfig;
}
