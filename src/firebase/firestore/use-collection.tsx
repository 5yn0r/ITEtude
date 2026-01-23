'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, collection, where, type Query, type DocumentData, type Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function useMemoizedQuery(queryFn: (db: Firestore) => Query | null) {
  const firestore = useFirestore();
  return useMemo(() => {
    if (!firestore) return null;
    return queryFn(firestore);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, queryFn]);
}

export function useCollection<T>(path: string | null) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const memoizedQuery = useMemo(() => {
      if (!firestore || !path) return null;
      return collection(firestore, path);
  }, [firestore, path]);

  useEffect(() => {
    if (!memoizedQuery) {
      setData([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(memoizedQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
      setData(docs);
      setLoading(false);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: (memoizedQuery as any).path, // We know query is not null here
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading };
}

    