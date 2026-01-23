'use client';

import { FirebaseClientProvider, initializeFirebase } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Initialize Firebase
const { app, auth, firestore } = initializeFirebase();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider app={app} auth={auth} firestore={firestore}>
      <FirebaseErrorListener />
      {children}
    </FirebaseClientProvider>
  );
}
