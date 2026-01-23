'use client';

import { FirebaseProvider } from './provider';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children, app, auth, firestore }: { children: React.ReactNode, app: FirebaseApp, auth: Auth, firestore: Firestore }) {
  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
