'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, type DocumentData, type Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export function useDoc<T>(path: string | null) {
    const firestore = useFirestore();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    const docRef = useMemo(() => {
        if (!firestore || !path) {
            return null;
        }
        // Ensure path has an even number of segments
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 0 || segments.length % 2 !== 0) {
            // Returning null will prevent the useEffect from running
            return null;
        }
        return doc(firestore, path);
    }, [firestore, path]);


    useEffect(() => {
        if (!docRef) {
            setData(null);
            setLoading(false);
            // Log error only if a path was provided but it was invalid
            if (path) {
                const segments = path.split('/').filter(Boolean);
                 if (segments.length > 0 && segments.length % 2 !== 0) {
                    console.error("Invalid document path provided to useDoc:", path);
                 }
            }
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
                setData({ ...snapshot.data(), id: snapshot.id } as unknown as T);
            } else {
                setData(null);
            }
            setLoading(false);
        }, (error) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [docRef, path]);

    return { data, loading };
}
