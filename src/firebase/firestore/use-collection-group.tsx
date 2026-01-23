'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, collectionGroup, type Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function useCollectionGroup<T>(collectionId: string | null) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const memoizedQuery = useMemo(() => {
    if (!firestore || !collectionId) return null;
    return collectionGroup(firestore, collectionId);
  }, [firestore, collectionId]);

  useEffect(() => {
    if (!memoizedQuery) {
      setData([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(memoizedQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const pathParts = doc.ref.path.split('/');
        // Assuming path like 'users/{userId}/progress/{resourceId}'
        const userId = pathParts.length > 1 ? pathParts[1] : undefined;
        return { 
          id: doc.id,
          userId,
          ...doc.data()
        } as unknown as T
      });
      setData(docs);
      setLoading(false);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: `Collection Group: ${collectionId}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [memoizedQuery, collectionId]);

  return { data, loading };
}
