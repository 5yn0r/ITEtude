'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client-side component that will listen for permission errors
// and throw them so they can be caught by Next.js's development error overlay.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // In a production environment, you might want to log this to a service
      // like Sentry, but in development, we'll just throw it to get the overlay.
      if (process.env.NODE_ENV === 'development') {
        // We throw in a timeout to break out of the current React render cycle
        // and ensure the error is caught by the global error handler.
        setTimeout(() => {
          throw error;
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    // No cleanup function is needed as the emitter lives for the app's lifetime.
  }, []);

  return null; // This component doesn't render anything
}

    