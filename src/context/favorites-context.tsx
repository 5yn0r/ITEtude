'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import type { UserProgress, ProgressStatus } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface FavoritesContextType {
  userProgress: UserProgress[];
  toggleFavorite: (resourceId: string) => void;
  isFavorite: (resourceId: string) => boolean;
  toggleResourceCompleted: (resourceId: string) => void;
  isCompleted: (resourceId: string) => boolean;
  resetPathProgress: (resourceIds: string[]) => void;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const { data: userProgressData, loading } = useCollection<UserProgress>(
    user ? `users/${user.uid}/progress` : null
  );
  
  const userProgress = userProgressData || [];

  const updateProgress = useCallback((resourceId: string, newProgress: Partial<Omit<UserProgress, 'id'>>) => {
    if (!user || !firestore) return;
    const progressRef = doc(firestore, `users/${user.uid}/progress`, resourceId);
    const existingProgress = userProgress.find(p => p.id === resourceId);

    const dataToSet = {
        status: existingProgress?.status || 'non commencé',
        isFavorite: existingProgress?.isFavorite || false,
        ...newProgress,
        updatedAt: serverTimestamp(),
    };

    setDoc(progressRef, dataToSet, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: progressRef.path,
        operation: 'write',
        requestResourceData: dataToSet,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [user, firestore, userProgress]);

  const toggleFavorite = useCallback((resourceId: string) => {
    const isCurrentlyFavorite = userProgress.some(p => p.id === resourceId && p.isFavorite);
    updateProgress(resourceId, { isFavorite: !isCurrentlyFavorite });
  }, [userProgress, updateProgress]);
  
  const isFavorite = useCallback((resourceId: string) => {
    return userProgress.some(p => p.id === resourceId && p.isFavorite);
  }, [userProgress]);

  const toggleResourceCompleted = useCallback((resourceId: string) => {
    const progress = userProgress.find(p => p.id === resourceId);
    const newStatus: ProgressStatus = progress?.status === 'terminé' ? 'en cours' : 'terminé';
    updateProgress(resourceId, { status: newStatus });
  }, [userProgress, updateProgress]);

  const isCompleted = useCallback((resourceId: string) => {
    return userProgress.some(p => p.id === resourceId && p.status === 'terminé');
  }, [userProgress]);

  const resetPathProgress = useCallback((resourceIds: string[]) => {
    if (!user || !firestore || resourceIds.length === 0) return;

    const batch = writeBatch(firestore);
    resourceIds.forEach(resourceId => {
        const progressRef = doc(firestore, `users/${user.uid}/progress`, resourceId);
        const existingProgress = userProgress.find(p => p.id === resourceId);

        const dataToSet = {
            status: 'non commencé' as ProgressStatus,
            isFavorite: existingProgress?.isFavorite || false, // Preserve favorite status
            updatedAt: serverTimestamp(),
        };
        batch.set(progressRef, dataToSet, { merge: true });
    });

    batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/progress`,
            operation: 'write',
            requestResourceData: { note: `Batch update to reset progress for ${resourceIds.length} resources.` },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [user, firestore, userProgress]);

  const value = {
    userProgress,
    toggleFavorite,
    isFavorite,
    toggleResourceCompleted,
    isCompleted,
    resetPathProgress,
    loading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
